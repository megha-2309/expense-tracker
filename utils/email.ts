import * as nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendPasswordResetEmail = async (
  toEmail: string,
  userName: string,
  resetToken: string,
): Promise<void> => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Spendly" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your Spendly password",

    text: `
Hi ${userName},

You requested a password reset for your Spendly account.

Click this link to reset your password (expires in 1 hour):
${resetUrl}

If you didn't request this, ignore this email. Your password won't change.

— Spendly Team
    `.trim(),

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width:560px; margin:40px auto; padding:0 20px;">
    
    <!-- Logo -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="display:inline-flex; align-items:center; gap:10px;">
        <div style="width:40px; height:40px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:12px; display:flex; align-items:center; justify-content:center;">
          <span style="color:white; font-size:18px;">↓</span>
        </div>
        <span style="color:#ffffff; font-size:22px; font-weight:700;">Spendly</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#0f0f12; border:1px solid #1c1c23; border-radius:20px; padding:40px;">
      <h1 style="color:#ffffff; font-size:24px; font-weight:700; margin:0 0 8px;">Reset your password</h1>
      <p style="color:#71717a; font-size:15px; margin:0 0 28px; line-height:1.6;">
        Hi ${userName}, we received a request to reset your password. Click the button below — the link expires in <strong style="color:#a1a1aa;">1 hour</strong>.
      </p>

      <!-- Button -->
      <div style="text-align:center; margin:32px 0;">
        <a href="${resetUrl}"
           style="display:inline-block; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:12px; font-size:15px; font-weight:600; letter-spacing:0.01em;">
          Reset Password
        </a>
      </div>

      <!-- Fallback URL -->
      <div style="background:#141418; border-radius:10px; padding:16px; margin-top:24px;">
        <p style="color:#52525b; font-size:12px; margin:0 0 6px;">If the button doesn't work, copy this link:</p>
        <p style="color:#6366f1; font-size:12px; margin:0; word-break:break-all;">${resetUrl}</p>
      </div>

      <!-- Warning -->
      <p style="color:#52525b; font-size:13px; margin:24px 0 0; text-align:center; line-height:1.6;">
        If you didn't request this, you can safely ignore this email.<br>Your password will not change.
      </p>
    </div>

    <p style="color:#3f3f46; font-size:12px; text-align:center; margin-top:24px;">
      © 2025 Spendly · Personal Expense Tracker
    </p>
  </div>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);

  console.log(`Password reset email sent to ${toEmail}`);
};

export const verifyEmailConfig = async (): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER or EMAIL_PASS not set — email sending will fail");
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email transporter verified");
  } catch (error) {
    console.error("Email transporter failed:", error);
  }
};
