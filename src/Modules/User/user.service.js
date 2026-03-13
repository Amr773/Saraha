import { TokenType } from "../../Common/Enums/token.enum.js";
import { decryptValue } from "../../Common/Security/encrypt.js";
import { generateToken, getSignature } from "../../Common/Security/token.js";
import * as dbRepo from "../../DB/db.respostory.js";
import UserModel from "../../DB/Models/User.js";

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
  const user = await dbRepo.findById({
    model: UserModel,
    id: profileId,
    select:
      "-password -role -confirmEmail -provider -createdAt -updatedAt -__v",
  });
  if(user.phone){
    user.phone = decryptValue({ cipherText: user.phone });
  }
  console.log(user.phone);
  
  return user;
}
