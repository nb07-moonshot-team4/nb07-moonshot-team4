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

router.post("/:taskId/comments", authMiddleware, createComment);
router.get("/:taskId/comments", getCommentsByTask);

router.get("/:commentId", authMiddleware, getCommentById);
router.patch("/:commentId", authMiddleware, updateComment);
router.delete("/:commentId", authMiddleware, deleteComment);

export default router;
