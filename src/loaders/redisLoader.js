import { createClient } from "redis";
import env from "../config/env.js";

export const redisClient = createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .on("connect", () => {
    console.log(`redis running on ${env.redisPort} localhost`);
  });

export default function redisLoader() {
  redisClient.connect();
}
