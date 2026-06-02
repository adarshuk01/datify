import nodemailer from 'nodemailer'

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export const sendVerificationEmail = async (to, token) => {
  const transporter = createTransporter()
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Datify <noreply@datify.app>',
    to,
    subject: 'Verify your Datify account',
    html: `
      <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(124,58,237,0.1);">
        <div style="background: linear-gradient(135deg, #7C3AED, #9333EA); padding: 40px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">Datify 💜</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Find Your Perfect Match</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1a1a2e; font-size: 22px; margin: 0 0 16px;">Verify Your Email</h2>
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
            Welcome to Datify! Please click the button below to verify your email address and start finding meaningful connections.
          </p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Verify Email
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        <div style="background: #f8f7ff; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2025 Datify. All rights reserved.</p>
        </div>
      </div>
    `,
  })
}

export const sendPasswordResetEmail = async (to, token) => {
  const transporter = createTransporter()
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Datify <noreply@datify.app>',
    to,
    subject: 'Reset your Datify password',
    html: `
      <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C3AED, #9333EA); padding: 40px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">Datify 💜</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1a1a2e; font-size: 22px; margin: 0 0 16px;">Reset Your Password</h2>
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
            You requested to reset your password. Click the button below to set a new password.
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0;">
            This link expires in 1 hour. If you didn't request a reset, please secure your account.
          </p>
        </div>
      </div>
    `,
  })
}
