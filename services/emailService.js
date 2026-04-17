const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"Cinemax 🎬" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <h2>Your OTP is:</h2>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;