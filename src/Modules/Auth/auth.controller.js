import express from "express";
import {
  login,
  sendOtp,
  signup,
  signupGmail,
  veriftOtp,
} from "./auth.service.js";
import {
  badRequestException,
  sucessResponse,
} from "../../Common/Response/response.js";
import { GenderEnum } from "../../Common/Enums/user.enums.js";
import { validation } from "../../Middleware/validation.middleware.js";
import { loginSchema, signupSchema } from "./auth.validation.js";

const authRouter = express.Router();

authRouter.post("/signup", validation(signupSchema), async (req, res) => {
  const result = await signup(req.body);
  return sucessResponse({ res, statusCode: 201, data: result });
});

authRouter.post("/signup/gmail", async (req, res) => {
  const { status, result } = await signupGmail(req.body.idToken);
  return sucessResponse({ res, statusCode: status, data: result });
});

authRouter.post("/login", validation(loginSchema), async (req, res) => {
  const result = await login(req.body, `${req.protocol}://${req.host}`);
  return sucessResponse({ res, statusCode: 201, data: result });
});

authRouter.post("/sendotp", async (req, res) => {
  const result = await sendOtp(req.body);
  return sucessResponse({ res, statusCode: 201, data: result });
});

authRouter.post("/verifyotp", async (req, res) => {
  const result = await veriftOtp(req.body);
  return sucessResponse({ res, statusCode: 201, data: result });
});

export default authRouter;
