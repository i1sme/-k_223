/**
 * Here is only a mock of PostgreSQL and we dont do any real conection to this DB.
 */

import "reflect-metadata"; // required by TypeORM decorators on entity imports
import { AppDataSource } from "../../data-source";
import { UserService } from "../UserService";
import { NotFoundError, ValidationError } from "../BaseService";

// ── Module mocks ─────────────────────────────────────────────────────────────
// We replace the entire data-source module so TypeORM never tries to connect.
jest.mock("../../data-source", () => ({
  AppDataSource: { getRepository: jest.fn() },
}));

// bcrypt is not being tested here; mocking it keeps each test fast.
jest.mock("bcrypt");

// ── Helper ───────────────────────────────────────────────────────────────────
function makeUser(overrides: { id?: string; username?: string } = {}) {
  return {
    id: "user-uuid-1",
    username: "oldname",
    passwordHash: "hashed_pw",
    role: "user" as const,
    isLocked: false,
    createdAt: new Date("2024-01-01"),
    posts: [],
    comments: [],
    likes: [],
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────
describe("UserService.updateProfile — username change", () => {
  let service: UserService;
  let mockFindOne: jest.Mock;
  let mockSave: jest.Mock;

  beforeEach(() => {
    // Fresh mocks for every test so call history never bleeds between cases.
    mockFindOne = jest.fn();
    mockSave = jest.fn().mockResolvedValue(undefined);

    // All three getRepository() calls inside the UserService constructor
    // receive the same mock object.  That is fine: only userRepo is exercised
    // by updateProfile.
    (AppDataSource.getRepository as jest.Mock).mockReturnValue({
      findOne: mockFindOne,
      save: mockSave,
    });

    service = new UserService();
  });

  // ── 1. Happy path ─────────────────────────────────────────────────────────

  it("returns the new username and saves the updated user", async () => {
    const user = makeUser();
    mockFindOne
      .mockResolvedValueOnce(user) // findOne({ where: { id } })
      .mockResolvedValueOnce(null); // findOne({ where: { username } }) → free

    const result = await service.updateProfile("user-uuid-1", {
      username: "newname",
    });

    expect(result).toEqual({
      id: "user-uuid-1",
      username: "newname",
      role: "user",
    });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ username: "newname" })
    );
  });

  // ── 2. Whitespace trimming ────────────────────────────────────────────────

  it("trims leading and trailing whitespace before saving", async () => {
    const user = makeUser();
    mockFindOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);

    const result = await service.updateProfile("user-uuid-1", {
      username: "  trimmed  ",
    });

    expect(result.username).toBe("trimmed");
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ username: "trimmed" })
    );
  });

  // ── 3. Same username (idempotent re-save) ─────────────────────────────────

  it("allows a user to re-save their own current username", async () => {
    // The uniqueness query finds the same user (existing.id === userId).
    const user = makeUser({ username: "samename" });
    mockFindOne
      .mockResolvedValueOnce(user) // fetch by id
      .mockResolvedValueOnce(user); // fetch by username → same user, allowed

    const result = await service.updateProfile("user-uuid-1", {
      username: "samename",
    });

    expect(result.username).toBe("samename");
    expect(mockSave).toHaveBeenCalled();
  });

  // ── 4. Username too short ─────────────────────────────────────────────────

  it("throws ValidationError when username is shorter than 3 characters", async () => {
    mockFindOne.mockResolvedValueOnce(makeUser());

    await expect(
      service.updateProfile("user-uuid-1", { username: "ab" })
    ).rejects.toThrow(ValidationError);
  });

  it("includes the expected message when username is too short", async () => {
    mockFindOne.mockResolvedValueOnce(makeUser());

    await expect(
      service.updateProfile("user-uuid-1", { username: "ab" })
    ).rejects.toThrow("Username must be at least 3 characters");
  });

  // ── 5. Username too long ──────────────────────────────────────────────────

  it("throws ValidationError when username exceeds 50 characters", async () => {
    mockFindOne.mockResolvedValueOnce(makeUser());

    await expect(
      service.updateProfile("user-uuid-1", { username: "a".repeat(51) })
    ).rejects.toThrow(ValidationError);
  });

  it("includes the expected message when username is too long", async () => {
    mockFindOne.mockResolvedValueOnce(makeUser());

    await expect(
      service.updateProfile("user-uuid-1", { username: "a".repeat(51) })
    ).rejects.toThrow("Username must not exceed 50 characters");
  });

  // ── 6. Username already taken ─────────────────────────────────────────────

  it("throws ValidationError when another user already has that username", async () => {
    const currentUser = makeUser({ id: "user-uuid-1" });
    const otherUser = makeUser({ id: "user-uuid-2", username: "takenname" });

    mockFindOne
      .mockResolvedValueOnce(currentUser) // fetch by id
      .mockResolvedValueOnce(otherUser); // fetch by username → different user

    await expect(
      service.updateProfile("user-uuid-1", { username: "takenname" })
    ).rejects.toThrow("Username is already taken");
  });

  // ── 7. User does not exist ────────────────────────────────────────────────

  it("throws NotFoundError when no user is found for the given id", async () => {
    mockFindOne.mockResolvedValueOnce(null); // user not in database

    await expect(
      service.updateProfile("nonexistent-id", { username: "anyname" })
    ).rejects.toThrow(NotFoundError);
  });

  it("includes the expected message when the user is not found", async () => {
    mockFindOne.mockResolvedValueOnce(null);

    await expect(
      service.updateProfile("nonexistent-id", { username: "anyname" })
    ).rejects.toThrow("User not found");
  });

  // ── 8. No-op: dto.username is undefined ───────────────────────────────────

  it("does not change username and still saves when dto.username is undefined", async () => {
    const user = makeUser();
    mockFindOne.mockResolvedValueOnce(user);

    const result = await service.updateProfile("user-uuid-1", {});

    // Username must stay unchanged
    expect(result.username).toBe("oldname");
    // Save is still called (password may have changed; service always saves)
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ username: "oldname" })
    );
  });
});
