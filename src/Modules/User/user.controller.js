import express from "express";
import { sucessResponse } from "../../Common/Response/response.js";
import {
  coverProfileePic,
  getAnotherProfile,
  renewToken,
  uploadProfilePic,
} from "./user.service.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { TokenType } from "../../Common/Enums/token.enum.js";
import { authorization } from "../../Middleware/authorization.middleware.js";
import { RoleEnum } from "../../Common/Enums/user.enums.js";
import { validation } from "../../Middleware/validation.middleware.js";
import {
  allowedFileFormats,
  localUpload,
} from "../../Common/Multer/multer.config.js";
import {
  coverPicSchema,
  getAnotherUserProfileSchema,
  profilPicSchema,
} from "./user.validation.js";

const userRouter = express.Router();

userRouter.get(
  "/",
  authentication(TokenType.access),
  authorization([RoleEnum.User]),
  async (req, res) => {
    return sucessResponse({ res, statusCode: 201, data: req.user });
  },
);

userRouter.post(
  "/refresh-token",
  authentication(TokenType.refresh),
  async (req, res) => {
    const result = await renewToken(req.user);
    return sucessResponse({ res, statusCode: 201, data: result });
  },
);

userRouter.post(
  "/upload-mainPic",
  authentication(TokenType.access),
  localUpload({
    folderName: "User",
    allowedFormate: allowedFileFormats.img,
  }).single("profilePic"),
  validation(profilPicSchema),
  async (req, res) => {
    const result = await uploadProfilePic(req.user._id, req.file);
    return sucessResponse({ res, statusCode: 201, data: result });
  },
);

userRouter.post(
  "/upload-coverPic",
  authentication(TokenType.access),
  localUpload({
    folderName: "User",
    allowedFormate: allowedFileFormats.img,
  }).array("coverPic", 2),
  validation(coverPicSchema),
  async (req, res) => {
    const result = await coverProfileePic(req.user._id, req.files);
    return sucessResponse({ res, statusCode: 201, data: result });
  },
);

userRouter.get(
  "/share-profile/:profileId",
  validation(getAnotherUserProfileSchema),
  async (req, res) => {
    const result = await getAnotherProfile(req.params.profileId);
    return sucessResponse({ res, statusCode: 201, data: result });
  },
);

export default userRouter;
