import jwt from 'jsonwebtoken';

// 환경 변수에서 시크릿 키를 가져옴. (.env 설정)
const JWT_SECRET = process.env.JWT_SECRET || '6384725349e5482387a387f394857432098475320498573204985732049857';
const ACCESS_TOKEN_EXPIRES = '1h';
const REFRESH_TOKEN_EXPIRES = '14d';

export const AuthUtil = {
    // Access Token 생성 (실제 출입증)
    generateAccessToken: (userId: string): string => {
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES})
    },

    // Refresh Token 생성 (엑세스 토큰 유효 시간이 끝날 때마다 로그인 하기 귀찮음 => 리프래쉬 토큰)
    generateRefreshToken: (userId: string): string => {
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
    },

    // 토큰 검증
    verifyToken: (token: string) => {
        try {
            return jwt.verify(token, JWT_SECRET) as { userId: string };
        } catch (error: any) {
            return null;
        }
    }
};