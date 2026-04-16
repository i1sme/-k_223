import { Router } from "express";
import { CommentController } from "../controller/CommentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.put("/:id", CommentController.update);
router.delete("/:id", CommentController.remove);

export default router;
