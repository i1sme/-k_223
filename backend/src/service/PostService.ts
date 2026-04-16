import { AppDataSource } from "../data-source";
import { Post } from "../entity/Post";
import { UserRole } from "../entity/User";
import { BaseService, NotFoundError, ValidationError } from "./BaseService";

export interface CreatePostDto {
  content: string;
}

export interface PostResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; username: string };
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
}

export class PostService extends BaseService {
  private postRepo = AppDataSource.getRepository(Post);

  /** Returns all posts ordered from newest to oldest */
  public async getAllPosts(): Promise<PostResponse[]> {
    const posts = await this.postRepo.find({
      relations: ["author", "likes", "comments"],
      order: { createdAt: "DESC" },
    });
    return posts.map(this.toResponse);
  }

  /** Returns a single post with full details */
  public async getPostById(id: string): Promise<PostResponse> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ["author", "likes", "comments", "comments.author"],
    });
    if (!post) throw new NotFoundError("Post not found");
    return this.toResponse(post);
  }

  /** Creates a new post for the authenticated user */
  public async createPost(
    authorId: string,
    dto: CreatePostDto
  ): Promise<PostResponse> {
    this.validateContent(dto.content);

    const post = this.postRepo.create({ content: dto.content, authorId });
    await this.postRepo.save(post);

    return this.getPostById(post.id);
  }

  /** Updates post content; enforces ownership or elevated role */
  public async updatePost(
    postId: string,
    requesterId: string,
    requesterRole: UserRole,
    dto: CreatePostDto
  ): Promise<PostResponse> {
    this.validateContent(dto.content);

    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundError("Post not found");

    this.checkOwnershipOrElevatedRole(post.authorId, requesterId, requesterRole);

    post.content = dto.content;
    await this.postRepo.save(post);
    return this.getPostById(post.id);
  }

  /** Deletes a post; enforces ownership or elevated role */
  public async deletePost(
    postId: string,
    requesterId: string,
    requesterRole: UserRole
  ): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundError("Post not found");

    this.checkOwnershipOrElevatedRole(post.authorId, requesterId, requesterRole);

    await this.postRepo.remove(post);
  }

  /** Maps a Post entity to the API response shape */
  private toResponse = (post: Post): PostResponse => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: { id: post.author.id, username: post.author.username },
    likeCount: (post.likes ?? []).filter((l) => l.type === "like").length,
    dislikeCount: (post.likes ?? []).filter((l) => l.type === "dislike").length,
    commentCount: (post.comments ?? []).length,
  });

  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new ValidationError("Post content cannot be empty");
    }
    if (content.length > 280) {
      throw new ValidationError("Post content must not exceed 280 characters");
    }
  }
}
