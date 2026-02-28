import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    type: { type: String, enum: ["30_DAY", "7_DAY", "TEST"], required: true },
    status: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING" },
    scheduledFor: { type: Date, required: true },
    sentAt: { type: Date },
    errorMessage: { type: String }
  },
  { timestamps: true }
);

notificationSchema.index({ productId: 1, type: 1 }, { unique: false });

export default mongoose.model("Notification", notificationSchema);
