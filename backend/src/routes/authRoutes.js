import express from "express";
import { register, login, getMe, updateWalletAddress, updatePassword, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/wallet", protect, updateWalletAddress);
router.put("/password", protect, updatePassword);
router.put("/profile", protect, updateProfile);


export default router;
