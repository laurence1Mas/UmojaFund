import express from "express";
import { 
  createProjectWithFiles, 
  listProjects, 
  getProject, 
  approveProject 
} from "../controllers/projectController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import contributionRoutes from "./contributionRoutes.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Configuration Multer pour image + PDF
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

const uploadFiles = multer({ storage });

// Créer un projet avec fichiers (image + PDF)
router.post(
  "/",
  protect,
  uploadFiles.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
  ]),
  createProjectWithFiles
);

// Lister tous les projets
router.get("/", listProjects);

// Détails projet
router.get("/:id", getProject);

// Admin : approuver un projet
router.post("/:id/approve", protect, admin, approveProject);

// Routes contribution (POST /api/projects/:id/contribute)
router.use("/:id/contribute", contributionRoutes);

export default router;
