import { Request, Response } from "express";
import { CommentService } from "../service/CommentService";
import { handleError } from "./errorHandler";

const commentService = new CommentService();

export class CommentController {
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const comment = await commentService.createComment(
        req.params.postId,
        req.user!.id,
        req.body.content
      );
      res.status(201).json(comment);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const comment = await commentService.updateComment(
        req.params.id,
        req.user!.id,
        req.user!.role,
        req.body.content
      );
      res.json(comment);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async remove(req: Request, res: Response): Promise<void> {
    try {
      await commentService.deleteComment(
        req.params.id,
        req.user!.id,
        req.user!.role
      );
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async getByPost(req: Request, res: Response): Promise<void> {
    try {
      const comments = await commentService.getCommentsByPost(req.params.postId);
      res.json(comments);
    } catch (err) {
      handleError(err, res);
    }
  }
}
