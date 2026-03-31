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

export const confirmEmailSchema = {
  body: joi
    .object()
    .keys({
      email: CommonFieldValidation.email.required(),
      otp: CommonFieldValidation.OTP.required(),
    })
    .required(),
};

export const resendOTPConfirmEmailSchema = {
  body: joi
    .object()
    .keys({
      email: CommonFieldValidation.email.required(),
    })
    .required(),
};

export const sendOTPForgetPasswordSchema = {
  body: joi
    .object()
    .keys({
      email: CommonFieldValidation.email.required(),
    })
    .required(),
};

export const verfiyOTPForgetPasswordSchema = {
  body: joi
    .object()
    .keys({
      email: CommonFieldValidation.email.required(),
      otp: CommonFieldValidation.OTP.required(),
    })
    .required(),
};

export const resetPasswordSchema = {
  body: joi
    .object()
    .keys({
      email: CommonFieldValidation.email.required(),
      otp: CommonFieldValidation.OTP.required(),
      password: CommonFieldValidation.password.required(),
    })
    .required(),
};

export const loginConfirmSchema = {
  body: joi
    .object()
    .keys({
      email: CommonFieldValidation.email.required(),
      otp: CommonFieldValidation.OTP.required(),
    })
    .required(),
};
