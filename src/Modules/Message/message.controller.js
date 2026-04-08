import express from "express";
import {
  allowedFileFormats,
  localUpload,
} from "../../Common/Multer/multer.config.js";
import {
  getAllMsgs,
  getMsgById,
  removeMsg,
  sendMessage,
} from "./message.service.js";
import {
  badRequestException,
  sucessResponse,
} from "../../Common/Response/response.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { validation } from "../../Middleware/validation.middleware.js";
import {
  deleteMessageSchema,
  getMessageSchema,
  sendMessageSchema,
} from "./message.validation.js";

const messageRouter = express.Router();

messageRouter.post(
  "/:receiverId",
  (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization) {
      const authMiddleware = authentication();
      return authMiddleware(req, res, next);
    }
    next();
  },
  localUpload({
    folderName: "Messages",
    allowedFormate: [...allowedFileFormats.img, ...allowedFileFormats.video],
  }).array("msgAttachments", 5),

  validation(sendMessageSchema),

  async (req, res) => {
    if (!req.body && !req.files) {
      return badRequestException("No message or files is sent");
    }

    await sendMessage(
      req.params.receiverId,
      req.body.content,
      req.files,
      req.user?._id,
    );
    return sucessResponse({ res, statusCode: 201, data: "Message Sent" });
  },
);

messageRouter.get(
  "/get-msg-by-id/:messageId",
  authentication(),
  validation(getMessageSchema),

  async (req, res) => {
    const result = await getMsgById(req.user, req.params.messageId);
    return sucessResponse({ res, statusCode: 201, data: result });
  },
);

messageRouter.get("/get-all-messages", authentication(), async (req, res) => {
  const result = await getAllMsgs(req.user._id);
  return sucessResponse({ res, statusCode: 201, data: result });
});

messageRouter.delete(
  "/:messageId",
  authentication(),
  validation(deleteMessageSchema),

  async (req, res) => {
    const result = await removeMsg(req.user, req.params.messageId);
    return sucessResponse({ res, statusCode: 201, data: "Message Deleted" });
  },
);

export default messageRouter;
