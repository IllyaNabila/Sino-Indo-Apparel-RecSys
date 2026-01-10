// src/lib/withErrorHandler.ts
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";

type HandlerFn = (req: NextRequest, context: any) => Promise<Response>;

export function withErrorHandler(handler: HandlerFn): HandlerFn {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (err: any) {
      if (err instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: err.code,
              message: err.message,
              ...(process.env.NODE_ENV !== "production" && err.details !== undefined
                ? { details: err.details }
                : {}),
            },
          },
          { status: err.status }
        );
      }

      console.error("[UnhandledError]", err);

      return NextResponse.json(
        { success: false, error: { code: "INTERNAL_ERROR", message: "Internal Server Error" } },
        { status: 500 }
      );
    }
  };
}
