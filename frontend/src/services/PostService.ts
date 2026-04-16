import { ApiClient } from "../api/ApiClient";

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string };
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
}

export interface LikeSummary {
  likeCount: number;
  dislikeCount: number;
  userReaction: "like" | "dislike" | null;
}

/** Provides CRUD operations and reactions for posts */
export class PostService {
  public static getAll(): Promise<Post[]> {
    return ApiClient.get<Post[]>("/posts");
  }

  public static getById(id: string): Promise<Post> {
    return ApiClient.get<Post>(`/posts/${id}`);
  }

  public static create(content: string): Promise<Post> {
    return ApiClient.post<Post>("/posts", { content });
  }

  public static update(id: string, content: string): Promise<Post> {
    return ApiClient.put<Post>(`/posts/${id}`, { content });
  }

  public static delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/posts/${id}`);
  }

  public static react(
    postId: string,
    type: "like" | "dislike"
  ): Promise<LikeSummary> {
    return ApiClient.post<LikeSummary>(`/posts/${postId}/like`, { type });
  }

  public static removeReaction(postId: string): Promise<LikeSummary> {
    return ApiClient.delete<LikeSummary>(`/posts/${postId}/like`);
  }
}
