import joi from "joi";
import { badRequestException } from "../Common/Response/response.js";

export function validation(schema) {
  return (req, res, next) => {
    const validationErrors = [];

    for (const schemaKey of Object.keys(schema)) {
      const validateResult = schema[schemaKey].validate(req[schemaKey], {
        abortEarly: false,
      });
      if (validateResult.error?.details.length > 0) {
        validationErrors.push(validateResult.error);
      }
    }

    if (validationErrors.length > 0) {
      throw badRequestException("validation Err", validationErrors);
    }

    next();
  };
}
