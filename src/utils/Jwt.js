import jwt from "jsonwebtoken";
export function createAccessJwt(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "20s",
  });
}

export function createRefreshJwt(userId) {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "365d",
  });
}
