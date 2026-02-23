import type { Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "../../error/errors.js";
import { MemberService } from "./member-service.js";

const service = new MemberService();

function parsePositiveInt(raw: unknown, fieldName: string) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    throw new BadRequestError(`${fieldName}가 올바르지 않습니다`, `INVALID_${fieldName.toUpperCase()}`);
  }
  return n;
}

// GET /projects/:projectId/users
export const listMembers = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new UnauthorizedError("로그인이 필요합니다");

  const projectId = parsePositiveInt(req.params.projectId, "projectId");

  const page = String((req.query as any)?.page ?? "1");
  const limit = String((req.query as any)?.limit ?? "20");

  const dto = await service.listMembers(user.id, projectId, page, limit);
  return res.json(dto);
};

// DELETE /projects/:projectId/users/:userId
export const deleteMember = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new UnauthorizedError("로그인이 필요합니다");

  const projectId = parsePositiveInt(req.params.projectId, "projectId");
  const targetUserId = parsePositiveInt(req.params.userId, "userId");

  await service.deleteMember(user.id, projectId, targetUserId);
  return res.status(204).end();
};

// POST /projects/:projectId/invitations
export const createInvitation = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new UnauthorizedError("로그인이 필요합니다");

  const projectId = parsePositiveInt(req.params.projectId, "projectId");

  const email = String((req.body as any)?.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new BadRequestError("잘못된 요청 형식");
  }
  const dto = await service.createInvitation(user.id, projectId, email);
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] invitationId=${dto.invitationId} projectId=${projectId} email=${email}`);
  }
  return res.status(201).json(dto);
};

//POST/invitations/:invitationId/accept
export const acceptInvitation = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new UnauthorizedError("로그인이 필요합니다", "UNAUTHORIZED");

  const invitationId = String(req.params.invitationId ?? "").trim();
  if (!invitationId) {
    throw new BadRequestError("잘못된 요청 형식");
  }
  await service.acceptInvitation(user.id, invitationId);
  return res.status(200).end();
};

//DELETE/invitations/:invitationId
export const deleteInvitation = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new UnauthorizedError("로그인이 필요합니다");
  const invitationId = String(req.params.invitationId ?? "").trim();
  if (!invitationId) {
    throw new BadRequestError("잘못된 요청 형식");
  }
  await service.deleteInvitation(user.id, invitationId);
  return res.status(204).end();
};