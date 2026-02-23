import express from "express";
import { login, signup } from "./auth.service.js";
import { sucessResponse } from "../../Common/Response/response.js";

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  const result = await signup(req.body);
  return sucessResponse({ res, statusCode: 201, data: result });
});

authRouter.post("/login", async (req, res) => {
  const result = await login(req.body,`${req.protocol}://${req.host}`);
  return sucessResponse({ res, statusCode: 201, data: result });
});

export default authRouter;
