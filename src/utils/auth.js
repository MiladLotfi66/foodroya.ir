import { hash, compare } from "bcryptjs";
import { sign,verify } from "jsonwebtoken";


async function hashPassword(password) {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
}

async function verifyPassword(password, hashedPassword) {
  const isValid = await compare(password, hashedPassword);
  return isValid;
}




export { hashPassword, verifyPassword };