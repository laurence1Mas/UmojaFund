import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  listAllProjectsAdmin,
  updateProjectStatus,
  rejectProject,
} from "../controllers/adminController.js";

const router = express.Router();

// Lister tous les projets avec filtres (status)
router.get("/projects", protect, admin, listAllProjectsAdmin);

// Modifier le statut d’un projet
router.patch("/projects/:id/status", protect, admin, updateProjectStatus);

// Rejeter un projet
router.post("/projects/:id/reject", protect, admin, rejectProject);

export default router;
