import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";
import { Post } from "../entity/Post";
import { Comment } from "../entity/Comment";
import { BaseService, NotFoundError, ValidationError } from "./BaseService";

const SALT_ROUNDS = 10;

export interface UpdateProfileDto {
  username?: string;
  password?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  isLocked: boolean;
  createdAt: Date;
  posts: Array<{ id: string; content: string; createdAt: Date }>;
  comments: Array<{ id: string; content: string; postId: string; createdAt: Date }>;
}

export class UserService extends BaseService {
  private userRepo = AppDataSource.getRepository(User);
  private postRepo = AppDataSource.getRepository(Post);
  private commentRepo = AppDataSource.getRepository(Comment);

  /** Returns the profile of the authenticated user with their activity */
  public async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const posts = await this.postRepo.find({
      where: { authorId: userId },
      order: { createdAt: "DESC" },
    });

    const comments = await this.commentRepo.find({
      where: { authorId: userId },
      order: { createdAt: "DESC" },
    });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      isLocked: user.isLocked,
      createdAt: user.createdAt,
      posts: posts.map((p) => ({
        id: p.id,
        content: p.content,
        createdAt: p.createdAt,
      })),
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        postId: c.postId,
        createdAt: c.createdAt,
      })),
    };
  }

  /** Updates username and/or password for the authenticated user */
  public async updateProfile(
    userId: string,
    dto: UpdateProfileDto
  ): Promise<{ id: string; username: string; role: UserRole }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    if (dto.username !== undefined) {
      const trimmed = dto.username.trim();
      if (trimmed.length < 3) {
        throw new ValidationError("Username must be at least 3 characters");
      }
      if (trimmed.length > 50) {
        throw new ValidationError("Username must not exceed 50 characters");
      }

      const existing = await this.userRepo.findOne({
        where: { username: trimmed },
      });
      if (existing && existing.id !== userId) {
        throw new ValidationError("Username is already taken");
      }

      user.username = trimmed;
    }

    if (dto.password !== undefined) {
      if (dto.password.length < 6) {
        throw new ValidationError("Password must be at least 6 characters");
      }
      user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    await this.userRepo.save(user);
    return { id: user.id, username: user.username, role: user.role };
  }

  /** Returns all users (admin only) */
  public async getAllUsers(): Promise<
    Array<{ id: string; username: string; role: UserRole; isLocked: boolean; createdAt: Date }>
  > {
    const users = await this.userRepo.find({ order: { createdAt: "ASC" } });
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      isLocked: u.isLocked,
      createdAt: u.createdAt,
    }));
  }

  /** Toggles the locked state of a user (admin only) */
  public async setLocked(userId: string, isLocked: boolean): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");
    user.isLocked = isLocked;
    await this.userRepo.save(user);
  }

  /** Changes the role of a user (admin only) */
  public async setRole(userId: string, role: UserRole): Promise<void> {
    const validRoles: UserRole[] = ["user", "moderator", "admin"];
    if (!validRoles.includes(role)) {
      throw new ValidationError("Invalid role");
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");
    user.role = role;
    await this.userRepo.save(user);
  }
}
