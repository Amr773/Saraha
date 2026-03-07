import { NODE_ENV } from "../../../config/config.service.js";

export function sucessResponse({ res, statusCode = 200, data }) {
  return res.status(statusCode).json({ statusCode, message: "done", data });
}

export function globalErrHandling(error, req, res, next) {
  return NODE_ENV == "dev"
    ? res.status(error.cause?.statusCode ?? 500).json({
        errMsg: error.message,
        error,
        stack: error.stack,
        extra: error.cause?.extra,
      })
    : res.status(error.cause?.statusCode ?? 500).json({
        errMsg: error.message,
        error,
        stack: error.stack,
        extra: error.cause?.extra,
      });
}

export function notFoundException(msg, extra) {
  throw new Error(msg, { cause: { statusCode: 404 } });
}

export function badRequestException(msg, extra) {
  throw new Error(msg, { cause: { statusCode: 400, extra } });
}
export function conflictException(msg, extra) {
  throw new Error(msg, { cause: { statusCode: 409, extra } });
}

export function unAuthorizedException(msg, extra) {
  throw new Error(msg, { cause: { statusCode: 401, extra } });
}

export function forbiddenException(msg, extra) {
  throw new Error(msg, { cause: { statusCode: 403, extra } });
}
