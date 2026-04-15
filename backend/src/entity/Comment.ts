import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ type: "text" })
  public content!: string;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;

  @Column({ name: "author_id" })
  public authorId!: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "author_id" })
  public author!: User;

  @Column({ name: "post_id" })
  public postId!: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  public post!: Post;
}
