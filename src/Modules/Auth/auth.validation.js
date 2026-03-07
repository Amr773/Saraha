import joi from "joi";
import { GenderEnum } from "../../Common/Enums/user.enums.js";

export const signupSchema = {
  query: joi.object({}).keys({
    ln: joi.string().valid("ar", "en", "fr"),
  }),
  body: joi
    .object({})
    .keys({
      userName: joi.string().alphanum().min(3).required().messages({
        "string.alphanum": "Username cannot contain special character",
        "any.required": "Username is required",
      }),
      email: joi.string().email().trim().required(),
      phone: joi.string(),
      password: joi.string().min(6).max(18).required(),
      confirmPassword: joi.string().valid(joi.ref("password")).required(),
      DOB: joi.date(),
      gender: joi.string().valid("male", "femal"),
      confirmEmail: joi
        .boolean()
        .sensitive()
        .truthy("y", "yes", 1)
        .falsy("n", "no", 0),
    })
    .required(),
};

export const loginSchema = joi
  .object({})
  .keys({
    userName: joi.string().alphanum().length(3).messages({
      "string.alphanum": "Username cannot contain special character",
      "any.required": "Username is required",
    }),
    email: joi.string().email().trim(),
    password: joi.string().min(6).max(18).required(),
  })
  .xor("userName", "email")
  .messages({
    "Object missing": "Please enter either the email or username",
  })
  .required();
