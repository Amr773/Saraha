import express from "express";
import { sucessResponse } from "../../Common/Response/response.js";
import { renewToken } from "./user.service.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { TokenType } from "../../Common/Enums/token.enum.js";

const userRouter = express.Router();

userRouter.get("/", authentication(TokenType.access), async (req, res) => {
  return sucessResponse({ res, statusCode: 201, data: req.user });
});

userRouter.post("/refresh-token", authentication(TokenType.refresh), async (req, res) => {
  const result = await renewToken(req.user);
  return sucessResponse({ res, statusCode: 201, data: result });
});

export default userRouter;
