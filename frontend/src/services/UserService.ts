import { ApiClient } from "../api/ApiClient";

export interface UserProfile {
  id: string;
  username: string;
  role: "user" | "moderator" | "admin";
  isLocked: boolean;
  createdAt: string;
  posts: Array<{ id: string; content: string; createdAt: string }>;
  comments: Array<{
    id: string;
    content: string;
    postId: string;
    createdAt: string;
  }>;
}

export interface UserListItem {
  id: string;
  username: string;
  role: "user" | "moderator" | "admin";
  isLocked: boolean;
  createdAt: string;
}

/** Provides user profile and admin user-management operations */
export class UserService {
  public static getProfile(): Promise<UserProfile> {
    return ApiClient.get<UserProfile>("/users/me");
  }

  public static updateProfile(dto: {
    username?: string;
    password?: string;
  }): Promise<{ id: string; username: string; role: string }> {
    return ApiClient.put("/users/me", dto);
  }

  public static getAllUsers(): Promise<UserListItem[]> {
    return ApiClient.get<UserListItem[]>("/users");
  }

  public static setLocked(userId: string, isLocked: boolean): Promise<void> {
    return ApiClient.put<void>(`/users/${userId}/lock`, { isLocked });
  }

  public static setRole(
    userId: string,
    role: "user" | "moderator" | "admin"
  ): Promise<void> {
    return ApiClient.put<void>(`/users/${userId}/role`, { role });
  }
}
