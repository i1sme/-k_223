import { Request, Response } from "express";
import { UserService } from "../service/UserService";
import { handleError } from "./errorHandler";

const userService = new UserService();

export class UserController {
  public static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const profile = await userService.getProfile(req.user!.id);
      res.json(profile);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async updateProfile(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const updated = await userService.updateProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async setLocked(req: Request, res: Response): Promise<void> {
    try {
      const { isLocked } = req.body as { isLocked: boolean };
      await userService.setLocked(req.params.id, isLocked);
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  }

  public static async setRole(req: Request, res: Response): Promise<void> {
    try {
      await userService.setRole(req.params.id, req.body.role);
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  }
}
