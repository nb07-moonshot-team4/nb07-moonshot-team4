import type { ErrorRequestHandler } from "express";
import { StructError } from "superstruct";
import { HttpError } from "./errors.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof StructError) {
    return res.status(400).json({
      message: "Invalid request",
      code: "VALIDATION_ERROR",
      details: err.failures().map((f) => ({
        path: f.path.join("."),
        message: f.message,
      })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.code,
    });
  }

  if ((err as any)?.code === "P2002") {
    return res.status(409).json({
      message: "Duplicate resource",
      code: "DUPLICATE_RESOURCE",
    });
  }

  if ((err as any)?.code === "P2025") {
    return res.status(404).json({
      message: "Resource not found",
      code: "RESOURCE_NOT_FOUND",
    });
  }


  console.error(err);
  return res.status(500).json({
    message: "Internal Server Error",
    code: "INTERNAL_ERROR",
  });
};