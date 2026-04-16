import { Router } from "express";
import { UserController } from "../controller/UserController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.use(authMiddleware);

// Own profile
router.get("/me", UserController.getProfile);
router.put("/me", UserController.updateProfile);

// Admin-only user management
router.get("/", requireRole("admin"), UserController.getAllUsers);
router.put("/:id/lock", requireRole("admin"), UserController.setLocked);
router.put("/:id/role", requireRole("admin"), UserController.setRole);

export default router;
