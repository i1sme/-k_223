import { Request, Response } from "express";
import { PostService } from "../service/PostService";
import { handleError } from "./errorHandler";

const postService = new PostService();

export class PostController {
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const posts = await postService.getAllPosts();
      res.json(posts);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async getOne(req: Request, res: Response): Promise<void> {
    try {
      const post = await postService.getPostById(req.params.id);
      res.json(post);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const post = await postService.createPost(req.user!.id, req.body);
      res.status(201).json(post);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const post = await postService.updatePost(
        req.params.id,
        req.user!.id,
        req.user!.role,
        req.body
      );
      res.json(post);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async remove(req: Request, res: Response): Promise<void> {
    try {
      await postService.deletePost(req.params.id, req.user!.id, req.user!.role);
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  }
}
