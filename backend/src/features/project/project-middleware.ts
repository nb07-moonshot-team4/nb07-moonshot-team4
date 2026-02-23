import { AuthRequest } from "../user/user-middleware.js";
import { Response, NextFunction } from "express";
import prisma from "../../shared/utils/prisma.js";

export const checkProjectMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.authUser || !req.authUser.id) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: Number(req.params.projectId),
        userId: req.authUser.id,
      },
    });

    if (!member) {
      return res.status(403).json({ message: "프로젝트 멤버가 아닙니다" });
    }

    next();
  } catch (error) {
    console.error("💥 checkProjectMember 에러:", error);
    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
};

export const checkProjectAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.authUser || !req.authUser.id) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }

    const admin = await prisma.projectMember.findFirst({
      where: {
        projectId: Number(req.params.projectId),
        userId: req.authUser.id,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return res.status(403).json({
        message: "프로젝트 관리자가 아닙니다",
      });
    }

    next();
  } catch (error) {
    console.error("💥 checkProjectAdmin 에러:", error);
    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
};
