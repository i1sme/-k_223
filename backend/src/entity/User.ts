import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Post } from "./Post";
import { Comment } from "./Comment";
import { Like } from "./Like";

/** Roles available in the application */
export type UserRole = "user" | "moderator" | "admin";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({ unique: true, length: 50 })
  public username!: string;

  @Column({ name: "password_hash" })
  public passwordHash!: string;

  @Column({
    type: "varchar",
    default: "user",
  })
  public role!: UserRole;

  @Column({ name: "is_locked", default: false })
  public isLocked!: boolean;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;

  @OneToMany(() => Post, (post) => post.author)
  public posts!: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  public comments!: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  public likes!: Like[];
}
