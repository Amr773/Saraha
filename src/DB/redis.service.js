import { client } from "./redis.connection.js";

export async function set({ key, value, exType = "EX", exValue = 120 }) {
  return await client.set(key, value, {
    expiration: { type: exType, value: Math.floor(exValue) },
  });
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
