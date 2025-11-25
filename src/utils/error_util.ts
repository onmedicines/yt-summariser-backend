import type { Response } from "express";

export const respondWithError = (
  res: Response,
  error: unknown,
  status = 400
) => {
  const isError = error instanceof Error;

  const errorMessage = isError
    ? error.message
    : typeof error === "string"
    ? error
    : (error as any)?.message || "Internal server error";

  const errorStatus = isError ? status : status || 500;

  const stack =
    process.env.NODE_ENV !== "production" && isError
      ? (error as Error).stack
      : undefined;

  return res.status(errorStatus).json({
    error: errorMessage,
    ...(stack && { stack }),
  });
};
