import { Router } from "express";
import { authMiddleware } from "../auth/auth-middleware.js"
import { withAsync } from "../common/async-handler.js"
import * as c from "./member-controller.js"

const router = Router();

router.get("/projects/:projectId/users", authMiddleware, withAsync(c.listMembers));
router.delete("/projects/:projectId/users/:userId", authMiddleware, withAsync(c.deleteMember));
router.post("/projects/:projectId/invitations", authMiddleware, withAsync(c.createInvitation));

export default router;