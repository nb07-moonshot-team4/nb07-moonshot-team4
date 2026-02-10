import { Router } from 'express';
import * as taskController from './task-controller.js';
import { authMiddleware } from '../auth/auth-middleware.js';

const router = Router();

router.get('/projects/:projectId/tasks', authMiddleware, taskController.getTasksByProjectId);
router.get('/tasks/:taskId', authMiddleware, taskController.getTask);
router.post('/projects/:projectId/tasks', authMiddleware, taskController.createTask);
router.post('/projects/:projectId/tasks/ai', authMiddleware, taskController.createTaskWithAI);
router.put('/tasks/:taskId', authMiddleware, taskController.updateTask);
router.delete('/tasks/:taskId', authMiddleware, taskController.deleteTask);
router.post('/tasks/:taskId/subtasks', authMiddleware, taskController.createSubTask);
router.get('/subtasks/:subTaskId', authMiddleware, taskController.getSubTask);
router.patch('/subtasks/:subTaskId', authMiddleware, taskController.updateSubTask);
router.delete('/subtasks/:subTaskId', authMiddleware, taskController.deleteSubTask);

export default router;
