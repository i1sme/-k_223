import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

/** A user can like or dislike a post (one reaction per user per post) */
export type LikeType = "like" | "dislike";

@Entity("likes")
@Unique(["userId", "postId"])
export class Like {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ type: "varchar" })
  public type!: LikeType;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;

  @Column({ name: "user_id" })
  public userId!: string;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  public user!: User;

  @Column({ name: "post_id" })
  public postId!: string;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  public post!: Post;
}
