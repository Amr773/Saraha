import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service.js";

export const client = createClient({
  url: REDIS_URL,
});

client.on("error", function (err) {
  throw err;
});

export async function testRedisConnection() {
  try {
    await client.connect();
    console.log("Redis Connected");
  } catch (error) {
    console.log("Redis Connection Error", error);
  }
}
