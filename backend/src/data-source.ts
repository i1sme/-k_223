import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Post } from "./entity/Post";
import { Comment } from "./entity/Comment";
import { Like } from "./entity/Like";

/** Single TypeORM DataSource instance — initialized once on app startup */
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "5432"),
  username: process.env.DB_USER ?? "minitwitter",
  password: process.env.DB_PASSWORD ?? "minitwitter",
  database: process.env.DB_NAME ?? "minitwitter",
  // Automatically creates/updates tables from entity definitions
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [User, Post, Comment, Like],
});
