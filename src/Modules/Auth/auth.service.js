import CryptoJS from "crypto-js";
import {
  conflictException,
  notFoundException,
} from "../../Common/Response/response.js";
import UserModel from "../../DB/Models/User.js";
import * as dbRepo from "../../DB/db.respostory.js";
import { ENCRYPTION_KEY, SALT_ROUND } from "../../../config/config.service.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import { TokenType } from "../../Common/Enums/token.enum.js";
import { generateToken, getSignature } from "../../Common/Security/token.js";

export async function signup(bodyData) {
  const { email } = bodyData;
  const isEmail = await dbRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (isEmail) {
    return conflictException("Email already exists");
  }

  bodyData.password = await hashOperation({
    plainText: bodyData.password,
    rounds: SALT_ROUND,
  });

  bodyData.phone = CryptoJS.AES.encrypt(
    bodyData.phone,
    ENCRYPTION_KEY,
  ).toString();

  const result = await dbRepo.create({
    model: UserModel,
    insertedData: bodyData,
  });
  return result;
}

export async function login(bodyData, url) {
  const { email, password } = bodyData;
  const user = await dbRepo.findOne({ model: UserModel, filters: { email } });

  if (!user) {
    return notFoundException("invalid info");
  }

  const isPasswordValid = await compareOperation({
    plainValue: password,
    hashedValue: user.password,
  });

  if (!isPasswordValid) {
    return notFoundException("invalid info");
  }

  const bytes = CryptoJS.AES.decrypt(user.phone, ENCRYPTION_KEY);
  const originalPhone = bytes.toString(CryptoJS.enc.Utf8);

  user.phone = originalPhone;
  const { accessSignature, refreshSignature } = getSignature(user.role);

  const access_token = generateToken({
    signature: accessSignature,
    options: {
      audience: [user.role, TokenType.access],
      expiresIn: 60 * 15,
      subject: user._id.toString(),
    },
  });

  const refresh_token = generateToken({
    signature: refreshSignature,
    options: {
      audience: [user.role, TokenType.refresh],
      expiresIn: "1y",
      subject: user._id.toString(),
    },
  });

  return { access_token, refresh_token };
}
