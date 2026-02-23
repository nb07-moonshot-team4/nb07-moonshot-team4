import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthUtil } from './auth-util.js';
import { google } from 'googleapis';

const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const AuthService = {
    
    // 회원가입 로직
    register: async (email: string, name: string, password: string) => {
    
    // 1. 기존 유저 확인
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if(existingUser) {
        throw new Error('이미 존재하는 이메일입니다.');
    }

    // 2. 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. DB 저장
    const newUser = await prisma.$transaction(async (tx) => {
        // User 테이블 생성
        const user = await tx.user.create({
            data: {
                email,
                name,
                // projectLimit: 5, 태원님 브랜치 합치기 전까지 주석 처리.
            },
        });

        // UserAuthProvider 테이블 생성
        await tx.userAuthProvider.create({
            data: {
                userId: user.id,
                provider: 'local',
                providerUserId: email,
                passwordHash: hashedPassword,
            },
        });

        // 토큰 발급 (user의 id가 num이라서 toString 추가)
        const accessToken = AuthUtil.generateAccessToken(user.id.toString());
        const refreshToken = AuthUtil.generateRefreshToken(user.id.toString());


        return { user, accessToken, refreshToken };
    });

        return newUser;
    },

    // 로그인 로직
    login: async (email: string, password: string) => {
        // 유저 및 인증 정보 확인
        const authProvider = await prisma.userAuthProvider.findFirst({
            where: {
                provider: 'local',
                providerUserId: email,
            },
            include: {
                user: true,
            },
        });

        if(!authProvider || !authProvider.passwordHash) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // 비밀번호 비교 확인
        const isMatch = await bcrypt.compare(password, authProvider.passwordHash);
        if(!isMatch){
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
        }

        // 토큰 발급
        const user = authProvider.user;
        const accessToken = AuthUtil.generateAccessToken(user.id);
        const refreshToken = AuthUtil.generateRefreshToken(user.id);
        return { user, accessToken, refreshToken };
    },

    // 토큰 갱신
    refresh: async (token: string) => {
        const decoded = AuthUtil.verifyToken(token);
        if (!decoded) {
            throw new Error('유효하지 않거나 만료된 리프레쉬 토큰입니다.');
        }

        // 새 토큰 발급
        const newAccessToken = AuthUtil.generateAccessToken(decoded.userId);
        const newRefreshToken = AuthUtil.generateRefreshToken(decoded.userId);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    },

    googleLogin: async (code: string) => {
    // 교환 단계
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const people = google.people({ version: 'v1', auth: oauth2Client }); 
    const response = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses,names',
    });

    const email = response.data.emailAddresses?.[0].value;
    const nameFromGoogle = response.data.names?.[0].displayName;

    if (!email) {
        throw new Error('구글 계정에 등록된 이메일이 없습니다.');
    }

    // 트랜잭션
    const result = await prisma.$transaction(async (tx) => {
        // 유저 생성/업데이트
        const savedUser = await tx.user.upsert({
            where: { email: email },
            update: { name: nameFromGoogle || 'Google User' },
            create: { email, name: nameFromGoogle || 'Google User' },
        });

        await tx.userAuthProvider.upsert({
            where: { provider_providerUserId: { provider: 'google', providerUserId: email } },
            update: {},
            create: {
                userId: savedUser.id, // 위에서 생성된 savedUser의 ID 사용
                provider: 'google',
                providerUserId: email,
            },
        });

        return savedUser;
    }); 

    // 우리 서버용 JWT 발급
    const accessToken = AuthUtil.generateAccessToken(result.id);
    const refreshToken = AuthUtil.generateRefreshToken(result.id);

    return { user: result, accessToken, refreshToken };
    }
};