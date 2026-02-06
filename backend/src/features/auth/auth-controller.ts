import e, {Request, Response, Router} from 'express';
import { AuthService } from './auth-service.js';

const router = Router();

// 컨트롤러
export const AuthController = {

    // 회원가입
register: async (req: Request, res: Response) => {
   try{
    const {email, name, password} = req.body;
    
    // 유효성 검사
    if(!email || !name || !password) {
        return res.status(400).json({
            status: 'error',
            message: '이메일, 이름, 비밀번호는 필수 입력입니다.'
        });
    }
    
    // 서비스 호출
    const user = await AuthService.signUp(email, name, password);

    // 성공 응답
    return res.status(201).json({
        status: 'success',
        message: '회원가입에 성공했습니다',
        data: user,
    });
   }catch(error: any) {
    // 에러 처리
    return res.status(400).json({
        status: 'error',
        message: error.message || '회원가입 중 오류가 발생했습니다.'
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
                status: 'error',
                message: '이메일과 비밀번호를 입력해주세요.',
            });
        }

        const user = await AuthService.login(email, password);

        return res.status(200).json({
            status: 'success',
            message: '로그인에 성공했습니다.',
            data: user,
        });
    } catch (error: any) {
        return res.status(401).json({
            status: 'error',
            message: error.message || '로그인에 실패했습니다.'
        });
    }
},

    // 토큰 갱신 (refresh token 사용)
refresh: async (req: Request, res: Response) => {
    try{
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh Token이 필요합니다.',
            })
        }

        const user = await AuthService.refresh(refreshToken);

        return res.status(200).json({
            status: 'success',
            message: '토큰이 갱신되었습니다.',
            data: user,
        });
    } catch (error: any) {
        return res.status(401).json({
            status: 'error',
            message: '유효하지 않은 토큰입니다.'
        })
    }
},

    // 구글 로그인
googleLogin: (req: Request, res: Response) => {
    // 구글 인증 화면 URL 생성
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`;

    // 사용자를 구글 로그인 페이지로 보냄
    res.redirect(googleAuthUrl);
},

    // 구글 로그인 완료 후 돌아오는 곳 (추가 작성 필요함.)
googleCallback: async (req: Request, res: Response) => {
    try{
        const { code } = req.query;

        if(!code) {
            throw new Error('인증 코드가 없습니다.');
        }

        return res.status(200).json({
            status: 'success',
            message: '구글 로그인이 완료되었습니다.',
            data: {
                // 유저 정보 및 토큰
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        })
    }
}
}

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.get('/google', AuthController.googleLogin);
router.get('/google/callback', AuthController.googleCallback);

export default router;