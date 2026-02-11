import { AuthRequest } from "../user/user-middleware.js";
import { Response, NextFunction } from "express";
import prisma from "../../shared/utils/prisma.js";

export const checkProjectMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const member = await prisma.projectMember.findFirst({
    where: {
      projectId: Number(req.params.projectId),
      userId: req.authUser!.id,
    },
  });

  if (!member) {
    return res.status(403).json({
      message: "프로젝트 멤버가 아닙니다",
    });
  }

  next();
};

export const checkProjectAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const admin = await prisma.projectMember.findFirst({
    where: {
      projectId: Number(req.params.projectId),
      userId: req.authUser!.id,
      role: "ADMIN",
    },
  });

  if (!admin) {
    return res.status(403).json({
      message: "프로젝트 관리자가 아닙니다",
    });
  }

  next();
};