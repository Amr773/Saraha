import { TokenType } from "../../Common/Enums/token.enum.js";
import { decryptValue } from "../../Common/Security/encrypt.js";
import { generateToken, getSignature } from "../../Common/Security/token.js";
import * as dbRepo from "../../DB/db.respostory.js";
import * as redisMethods from "../../DB/redis.service.js";
import UserModel from "../../DB/Models/User.js";
import path from "node:path";
import { unlink } from "node:fs/promises";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import { badRequestException } from "../../Common/Response/response.js";
import { EmailEnum } from "../../Common/Enums/email.enum";
import { sendEmailOtp } from "../Auth/auth.service.js";

export async function renewToken(userData) {
  const { accessSignature } = getSignature(userData.role);

  const newAccessToken = generateToken({
    signature: accessSignature,
    options: {
      audience: [userData.role, TokenType.access],
      expiresIn: 60 * 15,
      subject: userData._id.toString(),
    },
  });

  return newAccessToken;
}

export async function uploadProfilePic(userID, file) {
  await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: userID },
    data: { profilePic: file.finalPath },
  });
}

export async function coverProfileePic(userID, files) {
  const profilePicsPath = files.map((file) => {
    return file.finalPath;
  });

  await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: userID },
    data: { coverPic: profilePicsPath },
  });
}
export async function getAnotherProfile(profileId) {
  const user = await dbRepo.findByIdAndUpdate({
    model: UserModel,
    id: profileId,
    data: { $inc: { visitCount: 1 } },
    options: { new: true },
    select:
      "-password -role -confirmEmail -provider -createdAt -updatedAt -__v",
  });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 404 } });
  }

  if (user.phone) {
    user.phone = decryptValue({ cipherText: user.phone });
  }

  return user;
}

export async function logOut(userId, tokenData, logoutOptions) {
  if (logoutOptions == "all") {
    await dbRepo.updateOne({
      model: UserModel,
      filter: { _id: userId },
      data: { changeCreditTime: new Date() },
    });
  } else {
    await redisMethods.set({
      key: redisMethods.blackListTokenKey({ userId, tokenId: tokenData.jti }),
      value: tokenData.jti,
      exValue: 60 * 60 * 24 * 365 - (Date.now() / 1000 - tokenData.iat),
    });
  }
}

export async function deleteProfilePic(userID) {
  const user = await dbRepo.findById({
    model: UserModel,
    id: userID,
    select: "profilePic",
  });

  if (!user?.profilePic) {
    throw new Error("No profile picture to delete", {
      cause: { statusCode: 404 },
    });
  }

  const fullPath = path.resolve(user.profilePic);
  await unlink(fullPath);

  await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: userID },
    data: { profilePic: null },
  });
}

export async function updatePassword(bodyData, userData) {
  const { newPassword, oldPassword } = bodyData;
  const { password } = userData;

  const isOldPasswordValid = await compareOperation({
    plainValue: oldPassword,
    hashedValue: password,
  });

  if (!isOldPasswordValid) {
    return badRequestException("Invalid Password");
  }

  await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: userData._id },
    data: {
      password: await hashOperation({ plainText: newPassword }),
      changeCreditTime: new Date(),
    },
  });
}

export async function requestEnable2FA(user) {
  if (user.twoStepVerification) {
    return badRequestException("2-step verification is already enabled");
  }

  await sendEmailOtp({
    email: user.email,
    emailType: EmailEnum.twoStepVerification,
    subject: "Enable 2-Step Verification",
  });
}

export async function confirmEnable2FA(user, otp) {
  const storedOtp = await redisMethods.get(
    redisMethods.getOTPKey({
      email: user.email,
      emailType: EmailEnum.twoStepVerification,
    }),
  );

  if (!storedOtp) {
    return badRequestException("OTP expired");
  }

  const isOtpValid = await compareOperation({
    plainValue: otp,
    hashedValue: storedOtp,
  });

  if (!isOtpValid) {
    return badRequestException("OTP is invalid");
  }

  await dbRepo.updateOne({
    model: UserModel,
    filter: { _id: user._id },
    data: { twoStepVerification: true },
  });
}
