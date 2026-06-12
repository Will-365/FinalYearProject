import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendOTPEmail = async (email, fullName, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Your GreenCare Rwanda verification code: ${otp}`,
    html: `
      <div style="background-color: #f7f9f7; padding: 40px 0; font-family: sans-serif;">
        <div style="background-color: white; max-width: 520px; border-radius: 12px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #0d1f13; padding: 32px; text-align: center;">
            <h1 style="color: white; font-weight: 800; margin: 0; font-size: 24px;">GreenCare Rwanda</h1>
            <p style="color: rgba(255,255,255,0.5); margin: 5px 0 0 0; font-size: 14px;">Rwanda</p>
          </div>
          <div style="padding: 40px;">
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #333;">Hello ${fullName},</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #333;">Your verification code for GreenCare Rwanda is:</p>
            <div style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #16a34a; text-align: center; padding: 24px; background-color: #f0fdf4; border-radius: 8px; margin: 24px 0;">
              ${otp}
            </div>
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">This code expires in 10 minutes.</p>
            <p style="margin: 0; font-size: 14px; color: #666;">If you didn't create an account, please ignore this email.</p>
          </div>
          <div style="padding: 24px 40px; background-color: #f7f9f7; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">© 2026 GreenCare Rwanda. Kigali, Rwanda</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email, fullName, role) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to GreenCare Rwanda! 🌿',
    html: `
      <div style="background-color: #f7f9f7; padding: 40px 0; font-family: sans-serif;">
        <div style="background-color: white; max-width: 520px; border-radius: 12px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #0d1f13; padding: 32px; text-align: center;">
            <h1 style="color: white; font-weight: 800; margin: 0; font-size: 24px;">GreenCare Rwanda</h1>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #16a34a; margin: 0 0 16px 0;">Welcome, ${fullName}!</h2>
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #333;">We are thrilled to have you join us as a <strong>${role}</strong>.</p>
            <p style="margin: 0 0 24px 0; font-size: 16px; color: #333;">Together, we can make Rwanda greener and cleaner.</p>
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
            </div>
          </div>
          <div style="padding: 24px 40px; background-color: #f7f9f7; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">© 2026 GreenCare Rwanda. Kigali, Rwanda</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
