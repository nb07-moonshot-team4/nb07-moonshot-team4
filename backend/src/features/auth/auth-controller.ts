import e, {Request, Response } from 'express';
import { AuthService } from './auth-service.js';



// 컨트롤러
export const AuthController = {

    // 회원가입
register: async (req: Request, res: Response) => {
   try{
    const {email, name, password} = req.body;
    
    // 유효성 검사
    if(!email || !name || !password) {
        return res.status(400).json({
            error: '이메일, 이름, 비밀번호는 필수 입력입니다.',
          success: null,
        });
    }
    
    // 서비스 호출
    const result = await AuthService.register(email, name, password);

    // 성공 응답
    return res.status(201).json({
        success: true,
        message: '회원가입에 성공했습니다',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });
   }catch(error: any) {
    // 에러 처리
    return res.status(400).json({
        success: null,
        error: error.message || '회원가입 중 오류가 발생했습니다.',
    });
   }
},

    // 로그인
login: async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body;

        // 유효성 검사
        if(!email || !password) {
            return res.status(400).json({
                error: '이메일과 비밀번호를 입력해주세요.',
                success: null,
            });
        }

        const result = await AuthService.login(email, password);

        return res.status(200).json({
            success: true,
            message: '로그인에 성공했습니다.',
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
    } catch (error: any) {
        return res.status(401).json({
            success: null,
            error: error.message || '로그인에 실패했습니다.',
        });
    }
},

    // 토큰 갱신 (refresh token 사용)
refresh: async (req: Request, res: Response) => {
    try{
        const authHeader = req.headers.authorization;
        let refreshToken = authHeader && authHeader.split(' ')[1];
        if (!refreshToken) {
            refreshToken = req.body.refreshToken;
        }

        //const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(400).json({
                error: 'Refresh Token이 필요합니다.',
                success: null,
            })
        }

        const result = await AuthService.refresh(refreshToken);

        return res.status(200).json({
            success: true,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
    } catch (error: any) {
        return res.status(401).json({
            success: null,
            error: '유효하지 않은 토큰입니다.',
        })
    }
},

    // 구글 로그인
googleLogin: (req: Request, res: Response) => {
    // 캘린더 권한 추가 ?
    const scope = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/calendar' // 캘린더 팀원을 위한 권한
        ].join(' ');
    // 구글 인증 화면 URL 생성
const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(scope)}`;
    // 사용자를 구글 로그인 페이지로 보냄
    res.redirect(googleAuthUrl);
},

    // 구글 로그인 완료 후 돌아오는 곳 (추가 작성 필요함.)
googleCallback: async (req: Request, res: Response) => {
        try {
            const { code } = req.query;
            if (!code) throw new Error('인증 코드가 없습니다.');

            const result = await AuthService.googleLogin(code as string);
        
           const frontendUrl = `http://localhost:3001`; // 경로를 아예 메인으로 변경

return res.redirect(
    `${frontendUrl}/?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`
);
        } catch (error: any) {
            console.error('Google Callback Error:', error);
           return res.redirect(`http://localhost:3001/login?error=auth_failed`);
    }
}
}
