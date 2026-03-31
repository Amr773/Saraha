import CryptoJS from "crypto-js";
import {
  badRequestException,
  conflictException,
  notFoundException,
} from "../../Common/Response/response.js";
import UserModel from "../../DB/Models/User.js";
import * as dbRepo from "../../DB/db.respostory.js";
import * as redisMethods from "../../DB/redis.service.js";
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
import { encryptValue } from "../../Common/Security/encrypt.js";
import sendEmail from "../../Common/email/email.config.js";
import { EmailEnum } from "../../Common/Enums/email.enum.js";

export async function sendEmailOtp({ email, emailType, subject }) {
  const prevOtpTTL = await redisMethods.ttl(
    redisMethods.getOTPKey({ email, emailType }),
  );

  if (prevOtpTTL > 0) {
    return badRequestException(`Current OTP valid for ${prevOtpTTL} seconds `);
  }

  const isBlocked = await redisMethods.exists(
    redisMethods.getOTPBlockedKey({
      email,
      emailType,
    }),
  );

  if (isBlocked) {
    return badRequestException(`Please Try again later`);
  }

  const reqNo = await redisMethods.get(
    redisMethods.getOTPReqNoKey({
      email,
      emailType,
    }),
  );

  if (reqNo == 5) {
    await redisMethods.set({
      key: redisMethods.getOTPBlockedKey({
        email,
        emailType,
      }),
      value: 1,
      exValue: 60 * 10,
    });

    await redisMethods.del(redisMethods.getOTPReqNoKey({ email, emailType }));

    return badRequestException(`You exceeded the maxmium OTP resend attempts`);
  }

  const otp = generateOTP();
  await sendEmail({
    to: email,
    subject,
    html: `<h1>Your OTP ${otp}</h1>`,
  });

  await redisMethods.set({
    key: redisMethods.getOTPKey({ email, emailType }),
    value: await hashOperation({ plainText: otp }),
    exValue: 120,
  });

  await redisMethods.incr(
    redisMethods.getOTPReqNoKey({
      email,
      emailType,
    }),
  );
}

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

  if (bodyData.phone) {
    bodyData.phone = encryptValue({ value: bodyData.phone });
  }

  const result = await dbRepo.create({
    model: UserModel,
    insertedData: bodyData,
  });

  const otp = generateOTP();
  await sendEmailOtp({
    email,
    emailType: EmailEnum.confirmEmail,
    subject: "Confirm your Email",
  });

  return result;
}

export async function confirmEmail(bodyData) {
  const { email, otp } = bodyData;
  const user = await dbRepo.findOne({
    model: UserModel,
    filters: { email, confirmEmail: false },
  });

  if (!user) {
    return badRequestException("Invalid email or email already confirmed");
  }

  const storedOtp = await redisMethods.get(
    redisMethods.getOTPKey({ email, emailType: EmailEnum.confirmEmail }),
  );

  if (!storedOtp) {
    return badRequestException("OTP Expired");
  }

  const isOtpValid = await compareOperation({
    plainValue: otp,
    hashedValue: storedOtp,
  });

  if (!isOtpValid) {
    return badRequestException("OTP is invalid");
  }

  user.confirmEmail = true;
  await user.save();
}

export async function resendConfirmEmailOTP(email) {
  await sendEmailOtp({
    email,
    emailType: EmailEnum.confirmEmail,
    subject: "New OTP to Confirm Your Email",
  });
}

export async function resendForgetPasswordOTP(email) {
  await sendEmailOtp({
    email,
    emailType: EmailEnum.forgetPassword,
    subject: "New OTP to Reset Your Password",
  });
}

export async function forgetPasswordOTP(email) {
  const user = await dbRepo.findOne({ model: UserModel, filters: { email } });

  if (!user) {
    return;
  }

  if (!user.confirmEmail) {
    return badRequestException("Please confirm your email first");
  }

  await sendEmailOtp({
    email,
    emailType: EmailEnum.forgetPassword,
    subject: "OTP to reset your password",
  });
}

export async function verfiyForgetPasswordOTP(bodyData) {
  const { email, otp } = bodyData;

  const emailOTP = await redisMethods.get(
    redisMethods.getOTPKey({ email, emailType: EmailEnum.forgetPassword }),
  );

  if (!emailOTP) {
    return badRequestException("OTP Expired");
  }

  const isOtpValid = await compareOperation({
    plainValue: otp,
    hashedValue: emailOTP,
  });

  if (!isOtpValid) {
    return badRequestException("OTP is invalid");
  }
}

export async function resetPassword(bodyData) {
  const { email, password, otp } = bodyData;

  await verfiyForgetPasswordOTP({ email, otp });

  await dbRepo.updateOne({
    model: UserModel,
    filter: { email },
    data: { password: await hashOperation({ plainText: password }) },
  });
  return;
}

export async function login(bodyData, url) {
  const { email, password } = bodyData;

  const isBlocked = await redisMethods.exists(
    redisMethods.getLoginBlockedKey({ email }),
  );
  if (isBlocked) {
    const remainingTime = await redisMethods.ttl(
      redisMethods.getLoginBlockedKey({ email }),
    );
    return badRequestException(
      `Too many failed attempts. Try again in ${remainingTime} seconds`,
    );
  }

  const user = await dbRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (!user) return notFoundException("invalid info");
  if (!user.confirmEmail)
    return badRequestException("Please confirm your email first");

  const isPasswordValid = await compareOperation({
    plainValue: password,
    hashedValue: user.password,
  });

  if (!isPasswordValid) {
    const failedAttempts = await redisMethods.incr(
      redisMethods.getLoginAttemptsKey({ email }),
    );
    if (failedAttempts === 1) {
      await redisMethods.set({
        key: redisMethods.getLoginAttemptsKey({ email }),
        value: 1,
        exValue: 60 * 5,
      });
    }
    if (failedAttempts >= 5) {
      await redisMethods.set({
        key: redisMethods.getLoginBlockedKey({ email }),
        value: 1,
        exValue: 60 * 5,
      });
      await redisMethods.del(redisMethods.getLoginAttemptsKey({ email }));
      return badRequestException(
        "Too many failed attempts. You are banned for 5 minutes",
      );
    }
    return notFoundException(
      `invalid info, ${5 - failedAttempts} attempts remaining`,
    );
  }

  await redisMethods.del(redisMethods.getLoginAttemptsKey({ email }));

  if (user.twoStepVerification) {
    await redisMethods.set({
      key: redisMethods.getTwoFALoginKey({ email }),
      value: user._id.toString(),
      exValue: 60 * 10,
    });

    await sendEmailOtp({
      email,
      emailType: EmailEnum.twoStepVerification,
      subject: "Login Verification Code",
    });

    return { twoFARequired: true, message: "check your inbox" };
  }

  if (user.phone) {
    const bytes = CryptoJS.AES.decrypt(user.phone, ENCRYPTION_KEY);
    user.phone = bytes.toString(CryptoJS.enc.Utf8);
  }

  return generateAccAndRefTokens(user);
}

export async function loginConfirm({ email, otp }) {
  const storedOtp = await redisMethods.get(
    redisMethods.getOTPKey({ email, emailType: EmailEnum.twoStepVerification }),
  );

  if (!storedOtp) return badRequestException("OTP expired");

  const isOtpValid = await compareOperation({
    plainValue: otp,
    hashedValue: storedOtp,
  });

  if (!isOtpValid) return badRequestException("OTP is invalid");

  const userId = await redisMethods.get(
    redisMethods.getTwoFALoginKey({ email }),
  );

  if (!userId)
    return badRequestException("Login session expired, please login again");

  const user = await dbRepo.findById({ model: UserModel, id: userId });

  if (!user) return notFoundException("User not found");

  if (user.phone) {
    const bytes = CryptoJS.AES.decrypt(user.phone, ENCRYPTION_KEY);
    user.phone = bytes.toString(CryptoJS.enc.Utf8);
  }

  await redisMethods.del(redisMethods.getTwoFALoginKey({ email }));

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
