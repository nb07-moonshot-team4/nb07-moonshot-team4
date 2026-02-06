import { Request, Response, NextFunction } from 'express';
import { AuthUtil } from './auth-util.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // 헤더에서 토큰 추출
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        // 토큰이 없는 경우
        if (!token) {
            return res.status(401).json({
                status: 'error',
                mesaage: '인증 토큰이 없습니다.',
            });
        }

        // Util을 사용하여 토큰 검증
        const decoded = AuthUtil.verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                status: 'error',
                message: '유효하지 않거나 만료된 토큰입니다.',
            });
        }

        // 검증된 정보를 req에 담기
        (req as any).user = decoded;

        next();
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: '인증 처리 중서버 오류가 발생했습니다.',
        });
    }
};