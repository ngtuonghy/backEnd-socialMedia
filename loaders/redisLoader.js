import { createClient } from "redis";

export const redisClient = createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .on("connect", () => {
    console.log(`redis running on : localhost`);
  });

export default function redisLoader() {
  redisClient.connect();
}
