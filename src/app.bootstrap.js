import dotenv from "dotenv";
dotenv.config({ path: "./config/.env.dev" });
import express from "express";
import { testDBconnection } from "./DB/connection.js";
import { PORT } from "../config/config.service.js";
import { globalErrHandling } from "./Common/Response/response.js";
import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import cors from "cors";
import path from "node:path";
import { testRedisConnection } from "./DB/redis.connection.js";

async function bootstrap() {
  const app = express();
  const port = PORT;
  await testDBconnection();
  await testRedisConnection();

  app.use("/uploads", express.static(path.resolve("./uploads")));

  app.use(express.json(), cors());
  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  app.use(globalErrHandling);

  app.listen(port, () => console.log(`Server listening on port ${port}!`));
}

export default bootstrap;
