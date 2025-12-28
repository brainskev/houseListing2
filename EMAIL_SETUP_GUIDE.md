# Email Service Setup Guide

The application now includes email functionality for password resets and welcome messages. Follow the steps below to configure your preferred email provider.

## Option 1: Resend (Recommended - Easiest)

**Best for:** Modern development, simple API, generous free tier

### Setup Steps:

1. **Install Resend package:**

   ```bash
   npm install resend
   ```

2. **Sign up for Resend:**

   - Visit https://resend.com
   - Create a free account
   - Get your API key from the dashboard

3. **Add to `.env.local`:**

   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=PropertyPulse <noreply@yourdomain.com>
   ```

4. **Domain Verification (Optional but Recommended):**
   - In Resend dashboard, add and verify your domain
   - For testing, you can use `onboarding@resend.dev` as the sender

### Free Tier:

- 100 emails/day
- 3,000 emails/month
- Perfect for development and small projects

---

## Option 2: SendGrid

**Best for:** Established service, scalable, detailed analytics

### Setup Steps:

1. **Install SendGrid package:**

   ```bash
   npm install @sendgrid/mail
   ```

2. **Sign up for SendGrid:**

   - Visit https://sendgrid.com
   - Create a free account
   - Create an API key (Settings > API Keys)

3. **Update `utils/emailService.js`:**

   - Comment out the Resend import/code
   - Uncomment the SendGrid implementation (marked as OPTION 2)

4. **Add to `.env.local`:**

   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

5. **Verify sender email:**
   - In SendGrid dashboard, verify your sender email address
   - Go to Settings > Sender Authentication

### Free Tier:

- 100 emails/day
- 40,000 emails for first 30 days

---

## Option 3: Nodemailer (SMTP)

**Best for:** Using existing email accounts (Gmail, Outlook), no third-party service

### Setup Steps:

1. **Install Nodemailer:**

   ```bash
   npm install nodemailer
   ```

2. **Update `utils/emailService.js`:**

   - Comment out the Resend import/code
   - Uncomment the Nodemailer implementation (marked as OPTION 3)

3. **Configure SMTP settings in `.env.local`:**

   **For Gmail:**

   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM="PropertyPulse" <your-email@gmail.com>
   ```

   **For Outlook/Hotmail:**

   ```bash
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-password
   EMAIL_FROM="PropertyPulse" <your-email@outlook.com>
   ```

4. **Gmail App Password Setup (if using Gmail):**
   - Enable 2-Step Verification on your Google account
   - Go to https://myaccount.google.com/apppasswords
   - Create an app password for "Mail"
   - Use this app password in `SMTP_PASS` (not your regular password)

### Limits:

- Gmail: 500 emails/day for personal accounts, 2,000/day for Google Workspace
- Outlook: 300 emails/day for free accounts

---

## Testing Email Setup

### 1. Test in Development

Start the dev server and try the forgot password flow:

```bash
npm run dev
```

Navigate to `http://localhost:3000/forgot-password` and submit your email.

### 2. Check Console Output

If email sending fails, the reset link will be logged to the server console as a fallback:

```
Failed to send reset email: [error details]
Fallback - Password reset link: http://localhost:3000/reset-password?token=xxxxx
```

### 3. Test with Auth Debug Page

Visit `http://localhost:3000/auth-debug` and use the "Test Password Reset" button.

---

## Environment Variables Summary

Add these to your `.env.local` file based on your chosen provider:

```bash
# Existing variables
NEXT_PUBLIC_DOMAIN=http://localhost:3000
MONGODB_URL=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email Service (choose one)

# Option 1: Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=PropertyPulse <noreply@yourdomain.com>

# Option 2: SendGrid
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
# EMAIL_FROM=noreply@yourdomain.com

# Option 3: Nodemailer/SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# EMAIL_FROM="PropertyPulse" <your-email@gmail.com>
```

---

## Troubleshooting

### Email not sending

1. **Check API key/credentials:**

   - Verify the API key or SMTP credentials are correct
   - Check for extra spaces or quotes in `.env.local`

2. **Check console logs:**

   - Look for error messages in the terminal
   - The fallback reset link will be logged if email fails

3. **Domain verification:**

   - Resend/SendGrid require domain verification for production
   - Use test/onboarding emails for development

4. **SMTP authentication:**

   - Gmail requires app passwords (not regular password)
   - Check 2FA is enabled for Gmail

5. **Firewall/Network:**
   - Ensure your network allows outbound SMTP connections
   - Some ISPs block port 25, use port 587 instead

### Email in spam folder

1. **Add SPF/DKIM records:**

   - Follow your email provider's domain verification instructions
   - This tells email servers your emails are legitimate

2. **Use verified sender:**

   - Verify your domain in Resend/SendGrid
   - Use your own domain email instead of generic ones

3. **Test with different providers:**
   - Try different email providers as recipients
   - Gmail, Outlook, Yahoo may have different spam filters

---

## Production Checklist

Before deploying to production:

- [ ] Choose and configure ONE email provider
- [ ] Add production environment variables to hosting platform (Vercel, etc.)
- [ ] Update `EMAIL_FROM` to use your actual domain
- [ ] Verify sender domain in email provider dashboard
- [ ] Test password reset flow in production
- [ ] Test welcome email on signup
- [ ] Monitor email delivery rates in provider dashboard
- [ ] Set up error alerting for failed emails
- [ ] Remove console.log statements (or use proper logging service)
- [ ] Update `NEXT_PUBLIC_DOMAIN` to production URL
- [ ] Delete `/auth-debug` page and `AUTH_DEBUG_GUIDE.md`

---

## Email Templates

The email service includes two HTML templates:

1. **Password Reset Email** - Professional design with button and fallback link
2. **Welcome Email** - Greeting with quick start guide and action buttons

Both templates are mobile-responsive and include:

- PropertyPulse branding
- Clear call-to-action buttons
- Fallback text links
- Security warnings (for reset emails)
- Footer with copyright and unsubscribe info

To customize templates, edit the functions in `utils/emailService.js`:

- `getPasswordResetEmailHTML(resetUrl)`
- `getWelcomeEmailHTML(name)`

---

## Optional: Welcome Email on Signup

To send a welcome email when users sign up, add this to `app/api/auth/signup/route.js`:

```javascript
import { sendWelcomeEmail } from "@/utils/emailService";

// After creating the user:
try {
  await sendWelcomeEmail(user.email, user.name);
} catch (emailError) {
  console.error("Failed to send welcome email:", emailError);
  // Don't fail signup if welcome email fails
}
```

---

## Cost Comparison

| Provider            | Free Tier                 | Paid Plans Start At       | Best For                       |
| ------------------- | ------------------------- | ------------------------- | ------------------------------ |
| **Resend**          | 3,000/month               | $20/month (50k emails)    | Modern development, simple API |
| **SendGrid**        | 100/day                   | $19.95/month (50k emails) | Enterprise features, analytics |
| **Nodemailer/SMTP** | Depends on email provider | Varies                    | Using existing email account   |

---

## Additional Features

You can extend the email service to add:

- **Email verification on signup** - Require users to verify email before login
- **Two-factor authentication** - Send OTP codes via email
- **Property alerts** - Notify users of new listings matching their criteria
- **Message notifications** - Email when users receive messages
- **Weekly digest** - Send summary of new properties

Example implementations can be added to `utils/emailService.js` following the same patterns as password reset and welcome emails.

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review provider documentation:
   - Resend: https://resend.com/docs
   - SendGrid: https://docs.sendgrid.com
   - Nodemailer: https://nodemailer.com/about/
3. Check server console logs for detailed error messages
4. Test with the auth-debug page at `/auth-debug`

---

**Remember:** Email delivery is critical for password resets. Always test thoroughly in production before removing the console fallback logging!
