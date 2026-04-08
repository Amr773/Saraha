import { client } from "./redis.connection.js";

export async function set({ key, value, exType = "EX", exValue = 120 }) {
  return await client.set(key, value, {
    expiration: { type: exType, value: Math.floor(exValue) },
  });
}

export async function incr(key) {
  return await client.incr(key);
}
export async function decr(key) {
  return await client.decr(key);
}
export async function get(key) {
  return await client.get(key);
}

export async function mget(keys) {
  return await client.mGet(keys);
}
export async function ttl(key) {
  return await client.ttl(key);
}

export async function exists(key) {
  return await client.exists(key);
}

export async function persist(key) {
  return await client.persist(key);
}

export async function del(keys) {
  return await client.del(keys);
}

export async function update(key, value) {
  if (!(await exists(key))) {
    return 0;
  }

  await client.set(key, value);
  return 1;
}

export function blackListTokenKey({ userId, tokenId }) {
  return `blackListToken::${userId}::${tokenId}`;
}

export function getOTPKey({ email, emailType }) {
  return `OTP::${email}::${emailType}`;
}

export function getOTPReqNoKey({ email, emailType }) {
  return `OTP::${email}::${emailType}::No`;
}

export function getOTPBlockedKey({ email, emailType }) {
  return `OTP::${email}::${emailType}::Blocked`;
}

export function getOTPBlockedKeyTimeout({ email, emailType }) {
  return `OTP::${email}::${emailType}::BlockedNo`;
}

export const getLoginAttemptsKey = ({ email }) => `loginAttempts:${email}`;

export const getLoginBlockedKey = ({ email }) => `loginBlocked:${email}`;

export const getTwoFALoginKey = ({ email }) => `twoFALogin:${email}`;

export async function setExpire(key, seconds) {
  return await client.expire(key, Math.floor(seconds));
}
