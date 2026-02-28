import { NODE_ENV } from "../../../config/config.service.js";

export function sucessResponse({ res, statusCode = 200, data }) {
  return res.status(statusCode).json({ statusCode, message: "done", data });
}

export function globalErrHandling(error, req, res, next) {
  return NODE_ENV == "dev"
    ? res
        .status(error.cause?.statusCode ?? 500)
        .json({ errMsg: error.message, error, stack: error.stack })
    : res
        .status(error.cause?.statusCode ?? 500)
        .json({ errMsg: error.message, error, stack: error.stack });
}

export function notFoundException(msg) {
  throw new Error(msg, { cause: { statusCode: 404 } });
}

export function badRequestException(msg) {
  throw new Error(msg, { cause: { statusCode: 400 } });
}
export function conflictException(msg) {
  throw new Error(msg, { cause: { statusCode: 409 } });
}

export function unAuthorizedException(msg) {
  throw new Error(msg, { cause: { statusCode: 401 } });
}
