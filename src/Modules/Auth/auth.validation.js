import joi from "joi";
import { CommonFieldValidation } from "../../Middleware/validation.middleware.js";

export const loginSchema = {
  body: joi
    .object({})
    .keys({
      email: CommonFieldValidation.email.required(),
      password: CommonFieldValidation.password.required(),
    })
    .required(),
};

export const signupSchema = {
  query: joi.object({}).keys({
    ln: joi.string().valid("ar", "en", "fr"),
  }),
  body: joi
    .object({})
    .keys({
      userName: CommonFieldValidation.userName.required(),
      email: CommonFieldValidation.email.required(),
      password: CommonFieldValidation.password.required(),
      phone: CommonFieldValidation.phone,
      confirmPassword: joi.string().valid(joi.ref("password")).required(),
      DOB: CommonFieldValidation.DOB,
      gender: CommonFieldValidation.gender,
    })
    .required(),
};
