import cron from "node-cron";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { daysBetween } from "./date.js";
import { sendWarrantyEmail } from "./email.js";

async function alreadySent(productId: any, type: string) {
  const existing = await Notification.findOne({ productId, type, status: "SENT" });
  return !!existing;
}

async function createAndSend({ product, user, type, daysLeft }: any) {
  const scheduledFor = new Date();
  const notif = await Notification.create({
    userId: user._id,
    productId: product._id,
    type,
    status: "PENDING",
    scheduledFor
  });

  try {
    const subject = `Warranty expiring soon: ${product.productName}`;
    const html = `
      <div style="font-family:Arial">
        <h2>Warranty Reminder</h2>
        <p><b>Product:</b> ${product.productName}</p>
        <p><b>Expiry Date:</b> ${new Date(product.expiryDate).toDateString()}</p>
        <p><b>Days Left:</b> ${daysLeft}</p>
        ${product.invoiceFileUrl ? `<p><b>Invoice:</b> ${process.env.APP_URL}${product.invoiceFileUrl}</p>` : ""}
      </div>
    `;

    await sendWarrantyEmail({ to: user.email, subject, html });

    notif.status = "SENT";
    notif.sentAt = new Date();
    await notif.save();
  } catch (e: any) {
    notif.status = "FAILED";
    notif.errorMessage = e?.message || "Unknown error";
    await notif.save();
  }
}

// Runs daily at 9:00 AM
export function startScheduler() {
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Running warranty check...");
    try {
      const products = await Product.find({});
      for (const p of products) {
        const user = await User.findById(p.userId);
        if (!user) continue;

        const daysLeft = daysBetween(new Date(), p.expiryDate);

        if (daysLeft === 30 && !(await alreadySent(p._id, "30_DAY"))) {
          await createAndSend({ product: p, user, type: "30_DAY", daysLeft });
        }
        if (daysLeft === 7 && !(await alreadySent(p._id, "7_DAY"))) {
          await createAndSend({ product: p, user, type: "7_DAY", daysLeft });
        }
      }
    } catch (error) {
      console.error("Error in scheduler:", error);
    }
  });
}
