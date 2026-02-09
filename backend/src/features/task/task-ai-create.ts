import { GoogleGenerativeAI  } from '@google/generative-ai';
import {CreateTaskDto} from './task-dto.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ParsedTaskInput {
    title: string;
    startYear: number;
    startMonth: number;
    startDay: number;
    startHour?: number;
    startMinute?: number;
    endYear: number;
    endMonth?: number;
    endDay?: number;
    endHour?: number;
    endMinute?: number;
    tags?: string[];
    attachments: string[];
    subTasks: string[];
    content? : string;

}


export async function parseNaturalLanguageToTask(naturalLanguage: string): Promise<ParsedTaskInput> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        const currentDateStr = `${currentYear}-${currentMonth}-${currentDay}`;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const prompt = `당신은 자연어를 태스크 정보로 변환하는 전문가입니다. 
사용자 입력 : "${naturalLanguage}"
현재 날짜 : ${currentDateStr} 
다음 JSON 형식으로만 응답해주세요 (설명 없이 JSON만): 
{
"title": "태스크 제목",
"startYear": 시작 연도 (숫자),
"startMonth": 시작 월 (숫자),
"startDay": 시작 일 (숫자),
"startHour": 시작 시간 (숫자),
"startMinute": 시작 분 (숫자),
"endYear": 종료 연도 (숫자),
"endMonth": 종료 월 (숫자),
"endDay": 종료 일 (숫자),
"endHour": 종료 시간 (숫자),
"endMinute": 종료 분 (숫자),
"subTasks": ["서브 태스크 1", "서브 태스크 2", "서브 태스크 3"],
"tags": ["태그 1", "태그 2", "태그 3"],
"content": "추가 설명 (선택적)"
}
규칙 : 
1. 날짜 계산:
-"오늘" = ${currentDateStr}
-"내일" = 오늘 + 1일
-"모레" = 오늘 + 2일
-"일주일 후" = 오늘 + 7일
-"한 달 후" = 오늘 + 30일
-"3일 후" = 오늘 + 3일
-"5일 후" = 오늘 + 5일
-"10일 후" = 오늘 + 10일
-"15일 후" = 오늘 + 15일
-"20일 후" = 오늘 + 20일
-"25일 후" = 오늘 + 25일
-"30일 후" = 오늘 + 30일
2. 시간계산 :
-"점심" = 12:00
-"저녁" = 18:00
-"새벽" = 00:00
-"오전 10시" = 10:00
-"오후 2시" = 14:00
-"오후 3시" = 15:00
-"오후 4시" = 16:00
-"오후 5시" = 17:00
-"오후 6시" = 18:00
-시간이 명시되지 않으면 startHour = 9, startMinute = 0
-종료 시간이 명시되지 않으면 시작시간 + 1시간 

3. 제목 추출:
-자연어에서 핵심 키워드만 추출
-예: "내일모레 점심에 회의" -> "회의"
-예: "다음주 프로젝트 발표 준비" ->"프로젝트 발표 준비"

4. 서브태스크 생성:
-태스크 제목을 기반으로 논리적인 단계를 추론
-예 : "회의" -> ["회의 안건 준비", "발표 자료 검토", "회의실 예약"]
-예 : "프로젝트 발표" -> ["발표 자료 작성", "슬라이드 준비", "리허설"]
-서브태스크가 2-4개 정도가 적당합니다.
5. 태그 생성 : 
-태스크의 카테고리나 성격을 나타내는 태그
-예 : "회의" -> ["회의","업무"]
-예 : "프로젝트 발표" -> ["프로젝트","발표","중요"]
-태그는 1-3개 정도가 적당합니다.

6. content (설명) :
-자연어 입력에서 추가 정보가 있으면 포함 해주세요.
-예 : "내일모레 점심에 회의" -> "내일모레 점심에 회의를 위해 회의 안건을 준비해주세요."
-예 : "다음주 프로젝트 발표 준비" -> "다음주 프로젝트 발표를 위해 발표 자료를 작성해주세요."
-없으면 빈 문자열 ""

중요 : 반드시 유효한 JSON만 반환하고, 다른 설명은 포함하지 마세요.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        let jsonText = text.trim();
        
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(jsonText) as ParsedTaskInput;

        if (!parsed.title || !parsed.startYear || !parsed.startMonth || !parsed.startDay) {
            throw new Error("필수 정보가 누락되었습니다: title, startYear, startMonth, startDay는 필수입니다");
        }

        if (!parsed.endYear || !parsed.endMonth || !parsed.endDay) {
            parsed.endYear = parsed.startYear;
            parsed.endMonth = parsed.startMonth;
            parsed.endDay = parsed.startDay;
        }

        if (parsed.startHour === undefined) parsed.startHour = 9;
        if (parsed.startMinute === undefined) parsed.startMinute = 0;
        if (parsed.endHour === undefined) {
            parsed.endHour = (parsed.startHour || 9) + 1;
        }
        if (parsed.endMinute === undefined) parsed.endMinute = parsed.startMinute || 0;

        if (!parsed.tags) parsed.tags = [];
        if (!parsed.subTasks) parsed.subTasks = [];
        if (!parsed.attachments) parsed.attachments = [];

        return parsed;
    } catch (error: any) {
        console.error("Gemini AI 파싱 오류:", error);
        
        if (error instanceof SyntaxError) {
            throw {
                status: 500,
                message: `AI 응답을 파싱할 수 없습니다: ${error.message}`
            };
        }

        throw {
            status: 500,
            message: `자연어를 파싱하는 중 오류가 발생했습니다: ${error.message}`
        };
    }
}

export function convertParsedToCreateTaskDto(parsed: ParsedTaskInput): CreateTaskDto {
    return {
        title: parsed.title,
        content: parsed.content,
        startYear: parsed.startYear,
        startMonth: parsed.startMonth,
        startDay: parsed.startDay,
        endYear: parsed.endYear,
        endMonth: parsed.endMonth || parsed.startMonth,
        endDay: parsed.endDay || parsed.startDay,
        status: 'todo',
        tags: parsed.tags || [],
        attachments: parsed.attachments || [],
        subTasks: parsed.subTasks || [],
    };
}