import express from "express";
import {
  getMyNotifications,
  markAsRead
} from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getMyNotifications);
router.patch("/:id/read", auth, markAsRead);

export default router;
