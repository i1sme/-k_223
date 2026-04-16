import { ApiClient } from "../api/ApiClient";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string };
  postId: string;
}

/** Provides CRUD operations for comments */
export class CommentService {
  public static getByPost(postId: string): Promise<Comment[]> {
    return ApiClient.get<Comment[]>(`/posts/${postId}/comments`);
  }

  public static create(postId: string, content: string): Promise<Comment> {
    return ApiClient.post<Comment>(`/posts/${postId}/comments`, { content });
  }

  public static update(id: string, content: string): Promise<Comment> {
    return ApiClient.put<Comment>(`/comments/${id}`, { content });
  }

  public static delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/comments/${id}`);
  }
}
