import { AppDataSource } from "../data-source";
import { Like, LikeType } from "../entity/Like";
import { Post } from "../entity/Post";
import { BaseService, NotFoundError, ValidationError } from "./BaseService";

export interface LikeSummary {
  likeCount: number;
  dislikeCount: number;
  userReaction: LikeType | null;
}

export class LikeService extends BaseService {
  private likeRepo = AppDataSource.getRepository(Like);
  private postRepo = AppDataSource.getRepository(Post);

  /**
   * Upserts a like/dislike reaction for the given user and post.
   * If the same type is sent again, the existing reaction is removed (toggle).
   */
  public async reactToPost(
    postId: string,
    userId: string,
    type: LikeType
  ): Promise<LikeSummary> {
    if (type !== "like" && type !== "dislike") {
      throw new ValidationError('Reaction type must be "like" or "dislike"');
    }

    const postExists = await this.postRepo.findOne({ where: { id: postId } });
    if (!postExists) throw new NotFoundError("Post not found");

    const existing = await this.likeRepo.findOne({
      where: { postId, userId },
    });

    if (existing) {
      if (existing.type === type) {
        // Clicking the same reaction again removes it
        await this.likeRepo.remove(existing);
      } else {
        existing.type = type;
        await this.likeRepo.save(existing);
      }
    } else {
      const like = this.likeRepo.create({ postId, userId, type });
      await this.likeRepo.save(like);
    }

    return this.getSummary(postId, userId);
  }

  /** Removes the user's reaction from the post */
  public async removeReaction(
    postId: string,
    userId: string
  ): Promise<LikeSummary> {
    const existing = await this.likeRepo.findOne({
      where: { postId, userId },
    });
    if (existing) {
      await this.likeRepo.remove(existing);
    }
    return this.getSummary(postId, userId);
  }

  /** Returns the like/dislike counts and the current user's reaction */
  private async getSummary(
    postId: string,
    userId: string
  ): Promise<LikeSummary> {
    const likes = await this.likeRepo.find({ where: { postId } });
    const userLike = likes.find((l) => l.userId === userId);

    return {
      likeCount: likes.filter((l) => l.type === "like").length,
      dislikeCount: likes.filter((l) => l.type === "dislike").length,
      userReaction: userLike ? userLike.type : null,
    };
  }
}
