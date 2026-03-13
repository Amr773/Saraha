import joi from "joi";
import { badRequestException } from "../Common/Response/response.js";
import { GenderEnum } from "../Common/Enums/user.enums.js";
import { Types } from "mongoose";

export function validation(schema) {
  return (req, res, next) => {
    const validationErrors = [];

    for (const schemaKey of Object.keys(schema)) {
      const validateResult = schema[schemaKey].validate(req[schemaKey], {
        abortEarly: false,
      });

      req["v" + schemaKey] = validateResult.value;

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

export const CommonFieldValidation = {
  userName: joi
    .string()
    .pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/)),
  email: joi
    .string()
    .pattern(
      new RegExp(/^\w{3,25}@(gmail|yahoo|outlook|icloud)(.com|.net|.co|.eg)$/),
    ),
  phone: joi.string().pattern(new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)),
  password: joi
    .string()
    .pattern(
      new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,16}/),
    ),
  DOB: joi.date(),
  gender: joi.string().valid(...Object.values(GenderEnum)),
};


export function validateObjectId(value, helpers) {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.message("invalid objectId formate");
  }
}
