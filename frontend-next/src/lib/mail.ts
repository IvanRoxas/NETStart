import nodemailer from 'nodemailer';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (toEmail: string, code: string, name?: string) => {
  const displayName = name || 'Explorer';
  const mailOptions = {
    from: `"NETStart" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your NETStart Verification Code',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #150a21; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; color: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td style="padding-right: 15px; vertical-align: middle;">
                <img src="cid:netstarticon" alt="NETStart Logo" style="width: 56px; height: 56px; display: block;" />
              </td>
              <td style="vertical-align: middle;">
                <h2 style="margin: 0; font-size: 34px; font-weight: 800; letter-spacing: 1px; font-family: 'Inter', sans-serif;">
                  <span style="color: #ffffff;">NET</span><span style="color: #ff912d;">Start</span>
                </h2>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #1e0a2d; padding: 30px; border-radius: 12px; border: 1px solid rgba(255, 145, 45, 0.2);">
          <p style="font-size: 16px; margin-top: 0;">Hello, <strong style="color: #ffb703;">${displayName}</strong>!</p>
          <p style="font-size: 15px; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">Please use the following 6-digit verification code to securely verify your NETStart account:</p>
          
          <div style="background: linear-gradient(135deg, rgba(255, 145, 45, 0.1) 0%, rgba(255, 183, 3, 0.05) 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 1px dashed rgba(255, 145, 45, 0.3);">
            <strong style="font-size: 32px; letter-spacing: 8px; color: #ff912d; font-family: monospace;">${code}</strong>
          </div>
          
          <p style="color: rgba(255, 255, 255, 0.5); font-size: 13px; margin-bottom: 0;">This code will automatically expire in 15 minutes.</p>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;" />
          <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px;">The NETStart Security Team</p>
          <p style="color: rgba(255, 255, 255, 0.2); font-size: 10px; margin-top: 5px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      </div>
    `,
    attachments: [{
      filename: 'NETStartIcon.png',
      path: path.join(process.cwd(), 'public', 'NETStartIcon.png'),
      cid: 'netstarticon'
    }]
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/new-password?token=${token}`;
  
  const mailOptions = {
    from: `"NETStart" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'NETStart Security - Password Reset',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #130927; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; color: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td style="padding-right: 15px; vertical-align: middle;">
                <img src="cid:netstarticon" alt="NETStart Logo" style="width: 56px; height: 56px; display: block;" />
              </td>
              <td style="vertical-align: middle;">
                <h2 style="margin: 0; font-size: 34px; font-weight: 800; letter-spacing: 1px; font-family: 'Inter', sans-serif;">
                  <span style="color: #ffffff;">NET</span><span style="color: #ff912d;">Start</span>
                </h2>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #1e0a2d; padding: 30px; border-radius: 12px; border: 1px solid rgba(255, 145, 45, 0.2); text-align: center;">
          <h3 style="color: #ff912d; font-size: 20px; margin-top: 0; margin-bottom: 15px;">NETStart Security - Password Reset</h3>
          <p style="font-size: 15px; color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 25px;">
            A password reset was requested for your Guagua National Colleges NETStart account. Click the button below to set a new password:
          </p>
          
          <a href="${resetLink}" style="background-color: #ff912d; border-radius: 6px; padding: 12px 24px; color: white; text-decoration: none; display: inline-block; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(255, 145, 45, 0.2); transition: all 0.2s;">
            Reset Password
          </a>
          
          <p style="color: rgba(255, 255, 255, 0.4); font-size: 13px; margin-top: 25px; margin-bottom: 0;">
            This link is valid for 1 hour.
          </p>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;" />
          <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; font-weight: bold;">NETStart Security Team</p>
          <p style="color: rgba(255, 255, 255, 0.2); font-size: 11px; margin-top: 8px; line-height: 1.4;">
            If you did not request this, please ignore this email or contact your System Administrator.
          </p>
        </div>
      </div>
    `,
    attachments: [{
      filename: 'NETStartIcon.png',
      path: path.join(process.cwd(), 'public', 'NETStartIcon.png'),
      cid: 'netstarticon'
    }]
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
};
