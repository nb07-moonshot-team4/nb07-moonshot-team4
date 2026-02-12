import { Router } from "express";
import {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
  getCommentById,
} from "./comment-controller.js";
import { authMiddleware } from "../auth/auth-middleware.js";

const router = Router();

router.post("/tasks/:taskId/comments", authMiddleware, createComment);
router.get("/tasks/:taskId/comments", getCommentsByTask);

router.get("/comments/:commentId", authMiddleware, getCommentById);
router.patch("/comments/:commentId", authMiddleware, updateComment);
router.delete("/comments/:commentId", authMiddleware, deleteComment);

export default router;
