import { Router } from "express";
import { AuthService } from "./auth-service.js";
import { authMiddleware } from "../auth/auth-middleware.js";
import prisma from "../../shared/utils/prisma.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const result = await AuthService.signUp(email, name, password);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId || userPayload.id;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        projectLimit: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "내 정보 조회 실패", error: error.message });
  }
});

export default router;
