const nodemailer = require("nodemailer");

const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

const otpEmailHtml = (code) => `
  <div style="font-family: sans-serif; padding: 16px;">
    <h2>VoteSecure - OTP Verification</h2>
    <p>Your one-time password is:</p>
    <h1 style="letter-spacing: 4px;">${code}</h1>
    <p>This code expires in 5 minutes. Do not share it with anyone.</p>
  </div>
`;

// --- Option A: Brevo (Sendinblue) transactional email HTTP API -----------
// Used automatically whenever BREVO_API_KEY is set. This sends over HTTPS
// (port 443), which free-tier hosts like Render do NOT block — unlike raw
// SMTP (ports 25/465/587), which Render's free tier blocks outright.
// This is the option that works in production/deployment.
const sendViaBrevo = async (toEmail, code) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "VoteSecure", email: process.env.EMAIL_USER },
      to: [{ email: toEmail }],
      subject: "VoteSecure - OTP Verification",
      htmlContent: otpEmailHtml(code),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error (${res.status}): ${body}`);
  }
};

// --- Option B: Gmail via Nodemailer/SMTP ----------------------------------
// Works great for local development. Falls back to this automatically when
// BREVO_API_KEY isn't set, so local `npm run dev` keeps working as before.
const sendViaGmailSMTP = async (toEmail, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"VoteSecure" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "VoteSecure - OTP Verification",
    html: otpEmailHtml(code),
  });
};

const sendOTPEmail = async (toEmail, code) => {
  if (process.env.BREVO_API_KEY) {
    await sendViaBrevo(toEmail, code);
  } else {
    await sendViaGmailSMTP(toEmail, code);
  }
};

module.exports = { generateOTPCode, sendOTPEmail };