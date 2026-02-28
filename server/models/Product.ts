import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productName: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    purchaseDate: { type: Date, required: true },
    warrantyMonths: { type: Number, required: true },
    expiryDate: { type: Date, required: true, index: true },
    invoiceFileUrl: { type: String },
    invoiceText: { type: String },
    invoiceNumber: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
