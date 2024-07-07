import { customAlphabet } from "nanoid";

const alphabet = "0123456789";

export function generatePublicId(length) {
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
}
