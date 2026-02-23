import dotenv from "dotenv";
import path from "path";

export const NODE_ENV = process.env.NODE_ENV;

const envPath = {
  dev: path.resolve("./config/.env.dev"),
  prod: path.resolve("./config/.end.prod"),
};

dotenv.config({ path: envPath[NODE_ENV || "dev"] });

export const PORT = process.env.PORT || 3000;
export const DB_URL = process.env.DB_URL;
export const SALT_ROUND = parseInt(process.env.SALT_ROUND) || 10;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const TOKEN_SIGNATURE_USER = process.env.TOKEN_SIGNATURE_USER;
export const TOKEN_SIGNATURE_ADMIN = process.env.TOKEN_SIGNATURE_ADMIN;
