import express from "express";
import Product from "../models/Product.js";
import { addMonths } from "../utils/date.js";
import { auth, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// Create product
router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const { productName, brand, category, purchaseDate, warrantyMonths, invoiceFileUrl, invoiceText, invoiceNumber } = req.body || {};
    if (!productName || !category || !purchaseDate || !warrantyMonths) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const expiryDate = addMonths(purchaseDate, Number(warrantyMonths));
    const product = await Product.create({
      userId: req.user.userId,
      productName,
      brand,
      category,
      purchaseDate,
      warrantyMonths: Number(warrantyMonths),
      expiryDate,
      invoiceFileUrl,
      invoiceText,
      invoiceNumber
    });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating product" });
  }
});

// List + search/filter
router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const { q, category, expiringSoon } = req.query;

    const filter: any = { userId: req.user.userId };
    if (q) filter.productName = { $regex: q, $options: "i" };
    if (category) filter.category = category;

    if (expiringSoon === "true") {
      const now = new Date();
      const in30 = new Date();
      in30.setDate(in30.getDate() + 30);
      filter.expiryDate = { $gte: now, $lte: in30 };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Details
router.get("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const p = await Product.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!p) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(p);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

// Update
router.put("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const update: any = { ...req.body };
    if (update.purchaseDate && update.warrantyMonths) {
      update.expiryDate = addMonths(update.purchaseDate, Number(update.warrantyMonths));
    }
    const p = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      update,
      { new: true }
    );
    if (!p) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(p);
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
});

// Delete
router.delete("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const r = await Product.deleteOne({ _id: req.params.id, userId: req.user.userId });
    res.json({ deleted: r.deletedCount === 1 });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

export default router;
