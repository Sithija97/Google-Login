import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import AppError from "../utils/AppError";
import { z } from "zod";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies";

const handleZodErrors = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  return res.status(BAD_REQUEST).json({
    message: error.message,
    errors,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const errorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`PATH: ${req.path} `, error);

  if (error instanceof z.ZodError) {
    return handleZodErrors(res, error);
  }

  if (error instanceof AppError) {
    return handleAppError(res, error);
  }

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  return res.status(INTERNAL_SERVER_ERROR).send("Internal server Error.");
};

export default errorHandler;
