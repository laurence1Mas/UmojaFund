import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createContribution,
  checkoutContribution,
  confirmTx,
  listContributions
} from "../controllers/contributionController.js";

const router = express.Router({ mergeParams: true });

router.post("/", protect, createContribution);            // Création contribution
router.post("/checkout", protect, checkoutContribution);  // Mock checkout Cardano
router.post("/confirm", confirmTx);                        // Webhook confirmation
router.get("/", listContributions);                        // Lister toutes contributions

export default router;
