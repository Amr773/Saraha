import {
  badRequestException,
  notFoundException,
} from "../../Common/Response/response.js";
import * as dbRepo from "../../DB/db.respostory.js";
import UserModel from "../../DB/Models/User.js";
import MessageModel from "../../DB/Models/Message.js";

export async function sendMessage(receiverId, content, filesData, senderId) {
  const receiver = await dbRepo.findById({ model: UserModel, id: receiverId });

  if (!receiver) {
    return badRequestException("Receiver Not Found");
  }

  await dbRepo.create({
    model: MessageModel,
    insertedData: {
      content,
      attachments: filesData.map((file) => file.finalPath),
      senderId,
      receiverId,
    },
  });
}

export async function getMsgById(userData, messageId) {
  const msg = await dbRepo.findOne({
    model: MessageModel,
    filters: { _id: messageId, receiverId: userData._id },
    select: "-senderId",
  });

  if (!msg) {
    return notFoundException("Message not found");
  }
  return msg;
}

export async function getAllMsgs(userId) {
  const msgs = await dbRepo.find({
    model: MessageModel,
    filters: { $or: [{ receiverId: userId }, { senderId: userId }] },
    select: "-senderId",
  });

  if (!msgs.length) {
    return notFoundException("Message not found");
  }
  return msgs;
}

export async function removeMsg(userData, messageId) {
  const msgs = await dbRepo.deleteOne({
    model: MessageModel,
    filter: {
      _id: messageId,
      receiverId: userData._id,
    },
  });

  if (!msgs.deletedCount) {
    return notFoundException("Message not found");
  }
  return msgs;
}
