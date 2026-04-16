import { AppDataSource } from "../data-source";
import { Comment } from "../entity/Comment";
import { Post } from "../entity/Post";
import { UserRole } from "../entity/User";
import { BaseService, NotFoundError, ValidationError } from "./BaseService";

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; username: string };
  postId: string;
}

export class CommentService extends BaseService {
  private commentRepo = AppDataSource.getRepository(Comment);
  private postRepo = AppDataSource.getRepository(Post);

  /** Creates a comment on the specified post */
  public async createComment(
    postId: string,
    authorId: string,
    content: string
  ): Promise<CommentResponse> {
    this.validateContent(content);

    const postExists = await this.postRepo.findOne({ where: { id: postId } });
    if (!postExists) throw new NotFoundError("Post not found");

    const comment = this.commentRepo.create({ postId, authorId, content });
    await this.commentRepo.save(comment);

    return this.getCommentById(comment.id);
  }

  /** Updates a comment; enforces ownership or elevated role */
  public async updateComment(
    commentId: string,
    requesterId: string,
    requesterRole: UserRole,
    content: string
  ): Promise<CommentResponse> {
    this.validateContent(content);

    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundError("Comment not found");

    this.checkOwnershipOrElevatedRole(
      comment.authorId,
      requesterId,
      requesterRole
    );

    comment.content = content;
    await this.commentRepo.save(comment);
    return this.getCommentById(comment.id);
  }

  /** Deletes a comment; enforces ownership or elevated role */
  public async deleteComment(
    commentId: string,
    requesterId: string,
    requesterRole: UserRole
  ): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundError("Comment not found");

    this.checkOwnershipOrElevatedRole(
      comment.authorId,
      requesterId,
      requesterRole
    );

    await this.commentRepo.remove(comment);
  }

  /** Returns all comments for a given post */
  public async getCommentsByPost(postId: string): Promise<CommentResponse[]> {
    const comments = await this.commentRepo.find({
      where: { postId },
      relations: ["author"],
      order: { createdAt: "ASC" },
    });
    return comments.map(this.toResponse);
  }

  private async getCommentById(id: string): Promise<CommentResponse> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ["author"],
    });
    if (!comment) throw new NotFoundError("Comment not found");
    return this.toResponse(comment);
  }

  private toResponse = (comment: Comment): CommentResponse => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: { id: comment.author.id, username: comment.author.username },
    postId: comment.postId,
  });

  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new ValidationError("Comment content cannot be empty");
    }
    if (content.length > 1000) {
      throw new ValidationError(
        "Comment content must not exceed 1000 characters"
      );
    }
  }
}
