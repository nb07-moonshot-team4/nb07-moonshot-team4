import { Router } from 'express';
import * as taskController from './task-controller.js'
const router = Router();

router.get('/projects/:projectId/tasks', taskController.getTasksByProjectId);

router.get('/tasks/:taskId', taskController.getTask);

router.post('/projects/:projectId/tasks', taskController.createTask);

router.put('/tasks/:taskId', taskController.updateTask);

router.delete('/tasks/:taskId', taskController.deleteTask);

router.post('/tasks/:taskId/subtasks', taskController.createSubTask);

router.get('/subtasks/:subTaskId', taskController.getSubTask);

router.patch('/subtasks/:subTaskId', taskController.updateSubTask);

router.delete('/subtasks/:subTaskId', taskController.deleteSubTask);

export default router;
