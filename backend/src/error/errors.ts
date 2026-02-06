export class HttpError extends Error {
    constructor(
        public status: number,
        message: string,
        public code: string = "INTERNAL_ERROR"
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // 상속 시 타입 깨짐 방지
        Error.captureStackTrace(this, this.constructor);
    }

    // 헬퍼: 클래스 인스턴스 생성 없이 바로 던질 때 유용
    static badRequest(msg = "Bad Request", code = "BAD_REQUEST") { return new BadRequestError(msg, code); }
    static unauthorized(msg = "Unauthorized", code = "UNAUTHORIZED") { return new UnauthorizedError(msg, code); }
    static forbidden(msg = "Forbidden", code = "FORBIDDEN") { return new ForbiddenError(msg, code); }
    static notFound(msg = "Not Found", code = "NOT_FOUND") { return new NotFoundError(msg, code); }
    static conflict(msg = "Conflict", code = "CONFLICT") { return new ConflictError(msg, code); }
}

// 개별 클래스들 (사용자 요청 방식 가능하도록 정의)
export class BadRequestError extends HttpError {
    constructor(message = "Bad Request", code = "BAD_REQUEST") { super(400, message, code); }
}

export class UnauthorizedError extends HttpError {
    constructor(message = "Unauthorized", code = "UNAUTHORIZED") { super(401, message, code); }
}

export class ForbiddenError extends HttpError {
    constructor(message = "Forbidden", code = "FORBIDDEN") { super(403, message, code); }
}

export class NotFoundError extends HttpError {
    constructor(message = "Not Found", code = "NOT_FOUND") { super(404, message, code); }
}

export class ConflictError extends HttpError {
    constructor(message = "Conflict", code = "CONFLICT") { super(409, message, code); }
}