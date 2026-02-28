import express from "express";
import { auth, AuthRequest } from "../middleware/auth.js";
import Notification from "../models/Notification.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { daysBetween } from "../utils/date.js";
import { sendWarrantyEmail } from "../utils/email.js";

const router = express.Router();

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const logs = await Notification.find({ userId: req.user.userId })
      .populate("productId", "productName expiryDate")
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

router.post("/test", auth, async (req: AuthRequest, res) => {
  try {
    const { productId } = req.body || {};
    const product = await Product.findOne({ _id: productId, userId: req.user.userId });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const daysLeft = daysBetween(new Date(), product.expiryDate);

    const notif = await Notification.create({
      userId: user._id,
      productId: product._id,
      type: "TEST",
      status: "PENDING",
      scheduledFor: new Date()
    });

    try {
      await sendWarrantyEmail({
        to: user.email,
        subject: `TEST: Warranty Reminder for ${product.productName}`,
        html: `<p>This is a test reminder.</p><p>Days left: ${daysLeft}</p>`
      });
      notif.status = "SENT";
      notif.sentAt = new Date();
      await notif.save();
      res.json({ ok: true });
    } catch (e: any) {
      notif.status = "FAILED";
      notif.errorMessage = e?.message || "Unknown error";
      await notif.save();
      res.status(500).json({ ok: false, message: notif.errorMessage });
    }
  } catch (error) {
    res.status(500).json({ message: "Error sending test notification" });
  }
});

export default router;
