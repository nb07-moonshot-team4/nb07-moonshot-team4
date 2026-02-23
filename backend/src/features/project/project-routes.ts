import { Router } from 'express';
import { createProject, getProject, updateProject, deleteProject } from "./project-controller.js"
import { checkProjectMember, checkProjectAdmin } from "./project-middleware.js"
import { userMiddleware } from '../user/user-middleware.js';


const router = Router();

router.post('/', userMiddleware, createProject);
router.get('/:projectId', userMiddleware, checkProjectMember, getProject);
router.patch('/:projectId', userMiddleware, checkProjectAdmin, updateProject);
router.delete('/:projectId', userMiddleware, checkProjectAdmin, deleteProject);

export default router;