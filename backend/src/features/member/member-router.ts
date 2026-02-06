import { Router } from "express";
import { authMiddleware } from "../auth/auth-middleware.js"
import { withAsync } from "../../error/with-async.js"
import * as c from "./member-controller.js"

const router = Router();

router.get("/projects/:projectId/users", authMiddleware, withAsync(c.listMembers));
router.delete("/projects/:projectId/users/:userId", authMiddleware, withAsync(c.deleteMember));
router.post("/projects/:projectId/invitations", authMiddleware, withAsync(c.createInvitation));
router.post("/invitations/:invitationId/accept", authMiddleware, withAsync(c.acceptInvitation));
router.delete("/invitations/:invitationId", authMiddleware, withAsync(c.deleteInvitation));
export default router;