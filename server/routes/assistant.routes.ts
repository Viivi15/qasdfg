import express from "express";
import { auth, AuthRequest } from "../middleware/auth.js";
import Product from "../models/Product.js";
import { daysBetween } from "../utils/date.js";
import { SERVICE_DIRECTORY } from "../config/serviceDirectory.js";

const router = express.Router();

const phrases: any = {
  en: {
    notFound: "I couldn't find that product. Try the exact name from your dashboard.",
    inWarranty: (name: string, days: number) => `${name} is under warranty. ${days} days left.`,
    expired: (name: string, days: number) => `${name} warranty expired ${Math.abs(days)} days ago.`,
    service: (brand: string, phone: string, website: string) => `Support for ${brand}: ${phone} | ${website}`,
    emailDraft: (p: any) => `Subject: Warranty Claim Request - ${p.productName}\n\nHello,\nI purchased ${p.productName} on ${new Date(p.purchaseDate).toDateString()}.\nInvoice: ${p.invoiceNumber || "N/A"}.\nThe product is facing an issue: <describe issue>.\nKindly assist with warranty service.\n\nRegards,`
  },
  hi: {
    notFound: "मुझे वह प्रोडक्ट नहीं मिला। डैशबोर्ड में जैसा नाम है वैसा ट्राय करें।",
    inWarranty: (name: string, days: number) => `${name} वारंटी में है। ${days} दिन बाकी हैं।`,
    expired: (name: string, days: number) => `${name} की वारंटी ${Math.abs(days)} दिन पहले खत्म हो गई।`,
    service: (brand: string, phone: string, website: string) => `${brand} सपोर्ट: ${phone} | ${website}`,
    emailDraft: (p: any) => `विषय: वारंटी क्लेम - ${p.productName}\n\nनमस्ते,\nमैंने ${p.productName} ${new Date(p.purchaseDate).toDateString()} को खरीदा था।\nइनवॉइस: ${p.invoiceNumber || "N/A"}.\nसमस्या: <समस्या लिखें>.\nकृपया वारंटी सर्विस में सहायता करें।\n\nधन्यवाद,`
  },
  mr: {
    notFound: "तो प्रोडक्ट सापडला नाही. डॅशबोर्डमधलं अचूक नाव वापरून पहा.",
    inWarranty: (name: string, days: number) => `${name} वॉरंटीमध्ये आहे. ${days} दिवस बाकी आहेत.`,
    expired: (name: string, days: number) => `${name} ची वॉरंटी ${Math.abs(days)} दिवसांपूर्वी संपली.`,
    service: (brand: string, phone: string, website: string) => `${brand} सपोर्ट: ${phone} | ${website}`,
    emailDraft: (p: any) => `विषय: वॉरंटी क्लेम - ${p.productName}\n\nनमस्कार,\nमी ${p.productName} ${new Date(p.purchaseDate).toDateString()} रोजी खरेदी केले.\nइनव्हॉइस: ${p.invoiceNumber || "N/A"}.\nसमस्या: <समस्या लिहा>.\nकृपया वॉरंटी सर्विससाठी मदत करा.\n\nधन्यवाद,`
  }
};

function guessIntent(text: string) {
  const t = text.toLowerCase();
  if (t.includes("warranty") || t.includes("वारंटी") || t.includes("वॉरंटी")) return "WARRANTY_STATUS";
  if (t.includes("service") || t.includes("support") || t.includes("customer care") || t.includes("सपोर्ट")) return "SERVICE";
  if (t.includes("email") || t.includes("complaint") || t.includes("draft") || t.includes("ईमेल")) return "EMAIL_DRAFT";
  return "WARRANTY_STATUS";
}

router.post("/message", auth, async (req: AuthRequest, res) => {
  try {
    const { message, lang = "en" } = req.body || {};
    const L = phrases[lang] ? lang : "en";

    const intent = guessIntent(message || "");
    const products = await Product.find({ userId: req.user.userId });

    // naive product match: find product whose name appears in message
    const matched =
      products.find(p => (message || "").toLowerCase().includes(p.productName.toLowerCase())) || products[0] || null;

    if (!matched) {
      res.json({ reply: phrases[L].notFound });
      return;
    }

    if (intent === "SERVICE") {
      const info = SERVICE_DIRECTORY[matched.brand] || null;
      if (!info) {
        res.json({ reply: `No service info for ${matched.brand || "this brand"} yet.` });
        return;
      }
      res.json({ reply: phrases[L].service(matched.brand, info.phone, info.website) });
      return;
    }

    if (intent === "EMAIL_DRAFT") {
      res.json({ reply: phrases[L].emailDraft(matched) });
      return;
    }

    const daysLeft = daysBetween(new Date(), matched.expiryDate);
    const reply = daysLeft >= 0 ? phrases[L].inWarranty(matched.productName, daysLeft) : phrases[L].expired(matched.productName, daysLeft);
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing message" });
  }
});

export default router;
