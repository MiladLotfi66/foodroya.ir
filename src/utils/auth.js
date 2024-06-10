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

const generateAccessToken=(data)=>{
  const Token=sign({...data},process.env.ACCESSTOKENSECRET_KEY,{expiresIn:"1m"});
  return Token

}
const verifyAccessToken=(Token)=>{
 try {
   const tokenPayload= verify(Token , process.env.ACCESSTOKENSECRET_KEY)
   return tokenPayload

 } catch (error) {
  console.log("verify access token error -->",error);
  return false
 }

}

const generateRefreshToken=(data)=>{
  const Token=sign({...data},process.env.REFRESHTOKENSECRET_KEY,{expiresIn:"15d"});
  return Token
}



export { hashPassword, verifyPassword ,generateAccessToken ,verifyAccessToken ,generateRefreshToken};