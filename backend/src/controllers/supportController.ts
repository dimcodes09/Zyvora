import type { Request, Response, NextFunction } from "express";
import Groq from "groq-sdk";
import nodemailer from "nodemailer";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_key" });

interface SupportRequest {
  name: string;
  email: string;
  category: string;
  orderId?: string;
  message: string;
}

export const handleSupportRequest = async (
  req: Request<{}, any, SupportRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, category, orderId, message } = req.body;

    if (!name || !email || !category || !message) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }

    // 1. Generate AI response
    const prompt = `User has issue:
Category: ${category}
Message: ${message}
Generate a polite, professional customer support reply in 4–5 lines.`;

    let aiResponse = "Thank you for reaching out. Our team will look into this shortly.";
    
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 150,
        messages: [
          { role: "system", content: "You are a professional customer support agent for Zyvora." },
          { role: "user", content: prompt },
        ],
      });

      aiResponse = completion.choices[0]?.message?.content || aiResponse;
    } catch (aiError) {
      console.error("[supportController] AI generation failed, using fallback.", aiError);
    }

    // 2. Send Email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "nidk0321@gmail.com",
        pass: "tvhkoeveournjvkg",
      },
    });

    const mailOptions = {
      from: `"Zyvora Support" <nidk0321@gmail.com>`,
      to: email,   // ← send to the user's email from the form
      subject: "Support Request - Zyvora",
      text: `Dear ${name},\n\n${aiResponse}\n\n${orderId ? `Reference Order ID: ${orderId}\n\n` : ''}Best regards,\nZyvora Support Team`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("[supportController] Email failed to send (this is expected if no real credentials are set).", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Support response sent successfully",
    });

  } catch (err) {
    next(err);
  }
};
