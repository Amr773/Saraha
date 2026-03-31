import express from "express";
import {
  confirmEmail,
  forgetPasswordOTP,
  login,
  resendConfirmEmailOTP,
  resendForgetPasswordOTP,
  resetPassword,
  signup,
  signupGmail,
  verfiyForgetPasswordOTP,
} from "./auth.service.js";
import { sucessResponse } from "../../Common/Response/response.js";
import { validation } from "../../Middleware/validation.middleware.js";
import {
  confirmEmailSchema,
  loginConfirmSchema,
  loginSchema,
  resendOTPConfirmEmailSchema,
  resetPasswordSchema,
  sendOTPForgetPasswordSchema,
  signupSchema,
  verfiyOTPForgetPasswordSchema,
} from "./auth.validation.js";

const authRouter = express.Router();

authRouter.post("/signup", validation(signupSchema), async (req, res) => {
  const result = await signup(req.vbody);

  return sucessResponse({ res, statusCode: 201, data: "check your inbox" });
});

authRouter.post(
  "/confirm-email",
  validation(confirmEmailSchema),
  async (req, res) => {
    const result = await confirmEmail(req.vbody);
    return sucessResponse({ res, statusCode: 201, data: "confirmed" });
  },
);

authRouter.post(
  "/forget-password",
  validation(sendOTPForgetPasswordSchema),
  async (req, res) => {
    const result = await forgetPasswordOTP(req.vbody.email);
    return sucessResponse({ res, statusCode: 201, data: "check your inbox" });
  },
);

authRouter.post(
  "/verify-forget-password",
  validation(verfiyOTPForgetPasswordSchema),
  async (req, res) => {
    const result = await verfiyForgetPasswordOTP(req.vbody);
    return sucessResponse({ res, statusCode: 201, data: "verified" });
  },
);

authRouter.post(
  "/reset-password",
  validation(resetPasswordSchema),
  async (req, res) => {
    const result = await resetPassword(req.vbody);
    return sucessResponse({ res, statusCode: 201, data: "done" });
  },
);

authRouter.post(
  "/resend-otp-confirm-email",
  validation(resendOTPConfirmEmailSchema),
  async (req, res) => {
    const result = await resendConfirmEmailOTP(req.vbody.email);
    return sucessResponse({ res, statusCode: 201, data: "check your inbox" });
  },
);

authRouter.post(
  "/resend-otp-reset-password",
  validation(resendOTPConfirmEmailSchema),
  async (req, res) => {
    const result = await resendForgetPasswordOTP(req.vbody.email);
    return sucessResponse({ res, statusCode: 201, data: "check your inbox" });
  },
);

authRouter.post("/signup/gmail", async (req, res) => {
  const { status, result } = await signupGmail(req.body.idToken);
  return sucessResponse({ res, statusCode: status, data: result });
});

authRouter.post("/login", validation(loginSchema), async (req, res) => {
  console.log("dasdaa");

  const result = await login(req.body, `${req.protocol}://${req.host}`);
  return sucessResponse({ res, statusCode: 201, data: result });
});

authRouter.post(
  "/login/confirm",
  validation(loginConfirmSchema),
  async (req, res) => {
    const result = await loginConfirm(req.vbody);
    return sucessResponse({ res, statusCode: 200, data: result });
  },
);

export default authRouter;
