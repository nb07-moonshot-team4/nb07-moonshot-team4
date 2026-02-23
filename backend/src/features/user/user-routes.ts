import { Router } from 'express';
import { userMiddleware } from './user-middleware.js';
import * as userController from './user-controller.js';

const router = Router();

router.get('/me', userMiddleware, userController.getMyInfo);
router.patch('/me', userMiddleware, userController.UpdateMyInfo);
router.get('/me/projects', userMiddleware, userController.getMyProjects);
router.get('/me/tasks', userMiddleware, userController.getMyTodos);

export default router;