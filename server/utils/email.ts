import nodemailer from "nodemailer";

export function makeTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

export async function sendWarrantyEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email credentials not set. Skipping email send.");
    console.log(`To: ${to}, Subject: ${subject}`);
    return;
  }
  
  try {
    const transporter = makeTransport();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
}
