import multer from "multer";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

export const allowedFileFormats = {
  img: ["image/png", "image/jpg"],
  video: ["video/mp4"],
  pdf: ["application/pdf"],
};

allowedFileFormats.img;

export function localUpload({
  folderName = "GeneralFiles",
  allowedFormate = allowedFileFormats.img,
  fileSize = 5,
}) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fullPath = path.resolve(`./uploads/${folderName}`);

      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }

      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const fileName = randomUUID() + "_" + file.originalname;

      file.finalPath = `uploads/${folderName}/${fileName}`;

      cb(null, fileName);
    },
  });

  function fileFilter(req, file, cb) {
    if (!allowedFormate.includes(file.mimetype)) {
      return cb(
        new Error("invalid formate", { cause: { statusCode: 400 } }),
        false,
      );
    }

    return cb(null, true);
  }

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: fileSize * 1024 * 1024 },
  });
}
