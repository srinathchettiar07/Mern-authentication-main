import nodemailer from "nodemailer";
import {config} from "dotenv"
config();
export function sendMail(user, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "bigtopgun26@gmail.com",
      pass: "qgqypsbpyzzobaek", // App Password (use environment variables in production)
    },
  });

  // HTML Template
  const htmlTemplate = `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background: #f9f9f9; border-radius: 10px; color: #333;">
      <h2 style="color: #004aad;">Hello ${user.fullname},</h2>
      <p>We're verifying your email address <strong>${user.email}</strong>.</p>

      <p style="font-size: 16px;">Please use the following One-Time Password (OTP) to complete your verification:</p>

      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 28px; font-weight: bold; color: #222; letter-spacing: 4px;">${otp}</p>
      </div>

      <p style="font-size: 14px; color: #666;">
        This OTP is valid for 10 minutes. If you didn’t request this, you can safely ignore this email.
      </p>

      <p style="margin-top: 30px;">Best regards,<br>
      <strong>Team EduPlatform</strong></p>
    </div>
  `;
  
  const mailOptions = {
    from: `"EduPlatform" <bigtopgun26@gmail.com>`,
    to: user.email,
    subject: "Email Verification OTP",
    html: htmlTemplate,
  };

  transporter.sendMail(mailOptions, (error, emailResponse) => {
    if (error) {
      console.error("❌ Email sending failed:", error.message);
      console.log(user);
      return false;
    }
    console.log("✅ Email sent to", sender);
  });
return true;
}
