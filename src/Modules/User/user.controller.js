import express from "express";
import { sucessResponse } from "../../Common/Response/response.js";
import { getUserProfile } from "./user.service.js";

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  const result = await getUserProfile(req.headers.authorization);
  return sucessResponse({ res, statusCode: 201, data: result });
});

export default userRouter;
