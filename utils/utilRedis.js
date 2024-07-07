import { redisClient } from "./../loaders/redisLoader.js";

export function deleteKeysByPattern(pattern, nodelete) {
  const getKeys = redisClient.keys(pattern);
  getKeys.then((keys) => {
    if (nodelete) {
      keys = keys.filter((key) => key !== nodelete);
    }
    keys.forEach((key) => {
      // console.log(key);
      redisClient.del(key, (err) => {
        if (err) {
          // console.error(`Error deleting key ${key}: ${err}`);
        } else {
          // console.log(`Key ${key} in creteted`);
        }
      });
    });
  });
}
export async function redisDel(key) {
  await redisClient.del(key);
}
export async function redisSet(key, value, options) {
  try {
    if (options) {
      await redisClient.set(key, value, options);
      // console.log(`Dữ liệu đã được ghi vào Redis với key ${key}`);
    } else {
      await redisClient.set(key, value);
      // console.log(`Dữ liệu đã được ghi vào Redis với key ${key}`);
    }
  } catch (error) {
    // console.error("Lỗi khi ghi dữ liệu vào Redis:", error);
  }
}
export async function redisGet(key) {
  return await redisClient.get(key);
}
