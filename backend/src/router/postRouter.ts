import { Router } from "express";
import { PostController } from "../controller/PostController";
import { CommentController } from "../controller/CommentController";
import { LikeController } from "../controller/LikeController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All post routes require authentication
router.use(authMiddleware);

router.get("/", PostController.getAll);
router.get("/:id", PostController.getOne);
router.post("/", PostController.create);
router.put("/:id", PostController.update);
router.delete("/:id", PostController.remove);

// Comments nested under posts
router.get("/:postId/comments", CommentController.getByPost);
router.post("/:postId/comments", CommentController.create);

// Reactions nested under posts
router.post("/:postId/like", LikeController.react);
router.delete("/:postId/like", LikeController.remove);

export default router;
