import { Request, Response } from "express";
import { LikeService } from "../service/LikeService";
import { handleError } from "./errorHandler";

const likeService = new LikeService();

export class LikeController {
  public static async react(req: Request, res: Response): Promise<void> {
    try {
      const summary = await likeService.reactToPost(
        req.params.postId,
        req.user!.id,
        req.body.type
      );
      res.json(summary);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async remove(req: Request, res: Response): Promise<void> {
    try {
      const summary = await likeService.removeReaction(
        req.params.postId,
        req.user!.id
      );
      res.json(summary);
    } catch (err) {
      handleError(err, res);
    }
  }
}
