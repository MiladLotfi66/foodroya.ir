// app/actions/auth.js
"use server";

import jwt from 'jsonwebtoken';


const SECRET = process.env.ACCESSTOKENSECRET_KEY;
const REFRESH_SECRET = process.env.REFRESHTOKENSECRET_KEY;

export async function issueToken(userId) {
  const accessToken = jwt.sign({ userId }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export async function refreshToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    return issueToken(decoded.userId);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}
