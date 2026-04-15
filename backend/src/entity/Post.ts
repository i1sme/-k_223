import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";
import { Like } from "./Like";

@Entity("posts")
export class Post {
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

  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "author_id" })
  public author!: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  public comments!: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  public likes!: Like[];
}
