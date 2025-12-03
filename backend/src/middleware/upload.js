import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.mimetype.includes("image")) {
      return { folder: "umojafund/images", format: "png" };
    } else if (file.mimetype === "application/pdf") {
      return { folder: "umojafund/pdfs", format: "pdf" };
    }
    return { folder: "umojafund/others" };
  },
});

export const uploadFiles = multer({ storage });

export default uploadFiles;
