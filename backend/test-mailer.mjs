import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "nidk0321@gmail.com",
    pass: "tvhkoeveournjvkg",
  },
});

console.log("🔍 Verifying SMTP connection...");

try {
  await transporter.verify();
  console.log("✅ SMTP connection verified — nodemailer is working!");

  const info = await transporter.sendMail({
    from: '"Zyvora Test" <nidk0321@gmail.com>',
    to: "divyanshukubde8@gmail.com",
    subject: "Nodemailer Test — Zyvora",
    text: "If you see this, nodemailer is working correctly on your machine.",
  });

  console.log("📧 Test email sent! Message ID:", info.messageId);
} catch (err) {
  console.error("❌ Nodemailer failed:", err.message);
  if (err.code === "EAUTH") {
    console.error(
      "\n⚠️  Auth error — Gmail likely blocked the app password.\n" +
      "   Fix: Go to https://myaccount.google.com/apppasswords and regenerate the password.\n" +
      "   Make sure 2FA is ON for the Google account."
    );
  }
}
