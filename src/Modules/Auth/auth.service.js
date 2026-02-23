import { compare, hash } from "bcrypt";
import CryptoJS from "crypto-js";
import {
  conflictException,
  notFoundException,
} from "../../Common/Response/response.js";
import UserModel from "../../DB/Models/User.js";
import * as dbRepo from "../../DB/db.respostory.js";
import {
  ENCRYPTION_KEY,
  SALT_ROUND,
  TOKEN_SIGNATURE_ADMIN,
  TOKEN_SIGNATURE_USER,
} from "../../../config/config.service.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import jwt from "jsonwebtoken";
import { RoleEnum } from "../../Common/Enums/user.enums.js";

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

  let signature = "";
  switch (user.role) {
    case RoleEnum.User:
      signature = TOKEN_SIGNATURE_USER;
      break;

    case RoleEnum.Admin:
      signature = TOKEN_SIGNATURE_ADMIN;
      break;
  }

  const bytes = CryptoJS.AES.decrypt(user.phone, ENCRYPTION_KEY);
  const originalPhone = bytes.toString(CryptoJS.enc.Utf8);

  user.phone = originalPhone;

  const acess_token = jwt.sign({ sub: user._id }, signature, {
    expiresIn: 60 * 60,
    issuer: url,
    audience: user.role,
  });

  return acess_token;
}
