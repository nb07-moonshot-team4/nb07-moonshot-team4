import type { ErrorRequestHandler } from "express";
import { StructError } from "superstruct";
import { HttpError } from "./errors.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1. 유효성 검사 에러 (Superstruct)
  if (err instanceof StructError) {
    return res.status(400).json({
      message: "입력값 형식이 올바르지 않습니다.",
      code: "VALIDATION_ERROR",
      details: err.failures().map(f => ({ path: f.path.join("."), message: f.message })),
    });
  }

  // 2. HttpError (및 상속받은 모든 에러들)
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.code,
    });
  }

  // 3. DB 관련 에러 (Prisma 특화)
  if (err.code === "P2002") {
    return res.status(409).json({ message: "중복된 데이터가 존재합니다.", code: "DUPLICATE_RESOURCE" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "데이터를 찾을 수 없습니다.", code: "NOT_FOUND" });
  }

  // 4. 그 외 예측 못한 에러 (500)
  console.error("UNKNOWN ERROR 💥:", err);
  return res.status(500).json({
    message: "서버 내부 오류가 발생했습니다.",
    code: "INTERNAL_SERVER_ERROR",
  });
};