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
import messageRouter from "./Modules/Message/message.controller.js";
import helmet from "helmet";
import * as redisMethods from "./DB/redis.service.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import geolite from "geoip-lite";

async function bootstrap() {
  const app = express();
  const port = PORT;
  await testDBconnection();
  await testRedisConnection();

  app.set("trust proxy", true);

  app.use(
    express.json(),
    cors({ origin: "*" }),
    helmet(),
    rateLimit({
      windowMs: 1 * 60 * 1000,
      limit: (req, res) => {
        const geoInfo = geolite.lookup(req.ip);
        return geoInfo.country == "EG" ? 3 : 0;
      },
      legacyHeaders: false,
      requestPropertyName: "rateLimit",
      keyGenerator: (req) => {
        return `${ipKeyGenerator(req.ip)}-${req.path}`;
      },
      store: {
        incr: async (key, cb) => {
          const hits = await redisMethods.incr(key);
          if (hits == 1) {
            await redisMethods.setExpire(key, 60);
          }
          cb(null, hits);
        },
        async decrement(key) {
          const isKeyExist = await redisMethods.exists(key);
          if (isKeyExist) {
            await redisMethods.decr(key);
          }
        },
      },
      skipSuccessfulRequests: true,
    }),
  );

  app.use("/uploads", express.static(path.resolve("./uploads")));

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);

  app.use(globalErrHandling);

  app.listen(port, () => console.log(`Server listening on port ${port}!`));

  return app
}

export default bootstrap;
