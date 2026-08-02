const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

const sendOTPEmail = async (toEmail, code) => {
  const mailOptions = {
    from: `"VoteSecure" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "VoteSecure - OTP Verification",
    html: `
      <div style="font-family: sans-serif; padding: 16px;">
        <h2>VoteSecure - OTP Verification</h2>
        <p>Your one-time password is:</p>
        <h1 style="letter-spacing: 4px;">${code}</h1>
        <p>This code expires in 5 minutes. Do not share it with anyone.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTPCode, sendOTPEmail };
