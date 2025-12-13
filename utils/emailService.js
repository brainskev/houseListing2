/**
 * Email Service - Handles sending emails via Resend
 * 
 * Setup:
 * 1. Install: npm install resend
 * 2. Sign up at https://resend.com and get API key
 * 3. Add to .env.local: RESEND_API_KEY=re_xxxxx
 * 4. Verify your domain in Resend dashboard (or use onboarding@resend.dev for testing)
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - Password reset URL with token
 * @returns {Promise<Object>} - Email send result
 */
export async function sendPasswordResetEmail(to, resetUrl) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PropertyPulse <noreply@yourdomain.com>',
      to: [to],
      subject: 'Reset Your Password - PropertyPulse',
      html: getPasswordResetEmailHTML(resetUrl),
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send email');
    }

    console.log('Password reset email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('sendPasswordResetEmail error:', error);
    throw error;
  }
}

/**
 * Send welcome email after signup
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<Object>} - Email send result
 */
export async function sendWelcomeEmail(to, name) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PropertyPulse <noreply@yourdomain.com>',
      to: [to],
      subject: 'Welcome to PropertyPulse! 🏡',
      html: getWelcomeEmailHTML(name),
    });

    if (error) {
      console.error('Welcome email send error:', error);
      // Don't throw - welcome email is not critical
      return { success: false, error };
    }

    console.log('Welcome email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    // Don't throw - welcome email is not critical
    return { success: false, error };
  }
}

/**
 * HTML template for password reset email
 */
function getPasswordResetEmailHTML(resetUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    h1 {
      color: #1f2937;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      color: #4b5563;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .link {
      word-break: break-all;
      color: #2563eb;
      font-size: 14px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning p {
      margin: 0;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏡 PropertyPulse</div>
    </div>
    
    <h1>Reset Your Password</h1>
    
    <p>Hello,</p>
    
    <p>We received a request to reset your password for your PropertyPulse account. Click the button below to create a new password:</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p class="link">${resetUrl}</p>
    
    <div class="warning">
      <p><strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.</p>
    </div>
    
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} PropertyPulse. All rights reserved.</p>
      <p style="font-size: 12px; margin-top: 10px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * HTML template for welcome email
 */
function getWelcomeEmailHTML(name) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard`;
  const browseUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/properties`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    h1 {
      color: #1f2937;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      color: #4b5563;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 10px;
    }
    .button-secondary {
      background-color: #10b981;
    }
    .features {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .feature {
      margin: 15px 0;
    }
    .feature-icon {
      font-size: 20px;
      margin-right: 8px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏡 PropertyPulse</div>
    </div>
    
    <h1>Welcome to PropertyPulse, ${name}! 🎉</h1>
    
    <p>Thank you for joining PropertyPulse! We're excited to have you on board and help you find your perfect property.</p>
    
    <div class="features">
      <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">What you can do now:</h2>
      
      <div class="feature">
        <span class="feature-icon">🔍</span>
        <strong>Browse Properties</strong> - Explore thousands of listings
      </div>
      
      <div class="feature">
        <span class="feature-icon">❤️</span>
        <strong>Save Favorites</strong> - Bookmark properties you love
      </div>
      
      <div class="feature">
        <span class="feature-icon">📨</span>
        <strong>Contact Sellers</strong> - Send messages directly to property owners
      </div>
      
      <div class="feature">
        <span class="feature-icon">➕</span>
        <strong>List Your Property</strong> - Add your own properties to the platform
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
      <a href="${browseUrl}" class="button button-secondary">Browse Properties</a>
    </div>
    
    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
    
    <p>Happy house hunting! 🏡</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} PropertyPulse. All rights reserved.</p>
      <p style="font-size: 12px; margin-top: 10px;">
        You're receiving this email because you created an account on PropertyPulse.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ============= ALTERNATIVE IMPLEMENTATIONS =============

/**
 * OPTION 2: SendGrid Implementation
 * 
 * Install: npm install @sendgrid/mail
 * Setup: Get API key from https://sendgrid.com
 * Add to .env.local: SENDGRID_API_KEY=SG.xxxxx
 */
/*
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendPasswordResetEmailSendGrid(to, resetUrl) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    subject: 'Reset Your Password - PropertyPulse',
    html: getPasswordResetEmailHTML(resetUrl),
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent via SendGrid');
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
}
*/

/**
 * OPTION 3: Nodemailer (SMTP) Implementation
 * 
 * Install: npm install nodemailer
 * Works with Gmail, Outlook, or any SMTP server
 * Add to .env.local:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=your-app-password
 */
/*
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmailSMTP(to, resetUrl) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"PropertyPulse" <noreply@yourdomain.com>',
      to,
      subject: 'Reset Your Password - PropertyPulse',
      html: getPasswordResetEmailHTML(resetUrl),
    });

    console.log('Email sent via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('SMTP error:', error);
    throw error;
  }
}
*/
