import {
  TOKEN_SIGNATURE_ADMIN,
  TOKEN_SIGNATURE_USER,
} from "../../../config/config.service.js";
import { RoleEnum } from "../../Common/Enums/user.enums.js";
import * as dbRepo from "../../DB/db.respostory.js";
import UserModel from "../../DB/Models/User.js";
import jwt from "jsonwebtoken";

export async function getUserProfile(token) {
  const decodedToken = jwt.decode(token);
  let signature = "";
  switch (decodedToken.aud) {
    case RoleEnum.User:
      signature = TOKEN_SIGNATURE_USER;
      break;

    case RoleEnum.Admin:
      signature = TOKEN_SIGNATURE_ADMIN;
      break;
  }
  const verfiedToken = jwt.verify(token, signature);
  //   const user = await dbRepo.findById({ model: UserModel, id: userId });
  //   return user;
}
