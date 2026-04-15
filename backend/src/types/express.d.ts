import { UserRole } from "../entity/User";

/** Augment Express Request to carry authenticated user data */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}
