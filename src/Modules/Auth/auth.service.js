import CryptoJS from "crypto-js";
import {
  badRequestException,
  conflictException,
  notFoundException,
} from "../../Common/Response/response.js";
import UserModel from "../../DB/Models/User.js";
import * as dbRepo from "../../DB/db.respostory.js";
import {
  ENCRYPTION_KEY,
  GOOGLE_CLIENT_ID,
  SALT_ROUND,
} from "../../../config/config.service.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import { generateAccAndRefTokens } from "../../Common/Security/token.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../Common/Enums/user.enums.js";
import { generateOTP } from "../../Common/Security/otp.js";
import OtpModel from "../../DB/Models/OtpModel.js";

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
  return generateAccAndRefTokens(user);
}

async function verifyGoogleToken(idToken) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export async function loginWithGoogle(idToken) {
  const payload = await verifyGoogleToken(idToken);
  if (!payload.email_verified) {
    return badRequestException("Email must be verified");
  }

  const user = await dbRepo.findOne({
    model: UserModel,
    filters: { email: payload.email, provider: ProviderEnum.Google },
  });

  if (!user) {
    return signupGmail(idToken);
  }

  return { status: 201, result: generateAccAndRefTokens(user) };
}

export async function signupGmail(idToken) {
  const payloadGoogleToken = await verifyGoogleToken(idToken);

  if (!payloadGoogleToken.email_verified) {
    return badRequestException("Email must be verified");
  }

  const user = await dbRepo.findOne({
    model: UserModel,
    filters: { email: payloadGoogleToken.email },
  });

  if (user) {
    if (user.provider == ProviderEnum.System) {
      return badRequestException(
        "Email already exists, Please Login with your email and password",
      );
    }
    return { status: 200, result: await loginWithGoogle(idToken) };
  }

  const newUser = await dbRepo.create({
    model: UserModel,
    insertedData: {
      email: payloadGoogleToken.email,
      userName: payloadGoogleToken.name,
      profilePic: payloadGoogleToken.picture,
      confirmEmail: true,
      provider: ProviderEnum.Google,
    },
  });

  return { status: 201, result: generateAccAndRefTokens(newUser) };
}

export async function sendOtp(bodyData) {
  const { email } = bodyData;

  const otp = generateOTP();

  const result = await dbRepo.create({
    model: OtpModel,
    insertedData: { email, otp },
  });

  return result;
}

export async function veriftOtp(bodyData) {
  const { email, otp } = bodyData;

  const record = await dbRepo.findOne({
    model: OtpModel,
    filters: { email, otp },
  });

  if (!record) {
    return badRequestException("Invalid or expired OTP");
  }

  const result = OtpModel.deleteOne({ _id: record.id });

  return result;
}
