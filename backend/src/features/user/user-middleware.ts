import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./user.jwt.js";

export interface AuthRequest extends Request {
    authUser?: { id: number };
}

export const userMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({ message: '로그인이 필요합니다.'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyToken(token);
        req.authUser = { id: payload.userId };
        next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: '토큰 만료'});
        }
        return res.status(401).json({ message: '로그인이 필요합니다.'});
    }
};