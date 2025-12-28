# Complete Email Authentication System

This authentication system provides email/password and Google OAuth login with password reset functionality.

## ✅ Features Implemented

### Core Authentication

- ✅ Email + Password Signup with validation
- ✅ Email + Password Login
- ✅ Google OAuth (auto-creates users)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Role-based access (user/admin)
- ✅ JWT session strategy
- ✅ Protected routes via middleware

### Password Reset System

- ✅ Forgot password page
- ✅ Reset token generation (secure, 32-byte hex)
- ✅ Token expiry (1 hour)
- ✅ Reset password page with token validation
- ✅ Rate limiting (3 attempts per 15 minutes)
- ✅ Token invalidation after use
- ✅ Security: No email enumeration

### Security Features

- ✅ Server-side validation
- ✅ Frontend validation with error messages
- ✅ Safe error handling (no internal leaks)
- ✅ Password strength requirements (min 6 chars)
- ✅ Email normalization (lowercase + trim)
- ✅ Duplicate email prevention
- ✅ Secure token generation

## 🗂️ File Structure

### Utilities

- `utils/authHelpers.js` - Password hashing, validation, token generation, error handling

### API Routes

- `app/api/auth/signup/route.js` - User registration
- `app/api/auth/forgot-password/route.js` - Send password reset email
- `app/api/auth/reset-password/route.js` - Apply password reset

### Pages

- `app/signup/page.jsx` - Signup page
- `app/login/page.jsx` - Login page
- `app/forgot-password/page.jsx` - Request password reset
- `app/reset-password/page.jsx` - Reset password with token
- `app/dashboard/page.jsx` - Protected dashboard

### Components

- `components/Auth/CredentialsAuthForms.jsx` - Signup & login forms with validation

### Configuration

- `utils/authOptions.js` - NextAuth config (Credentials + Google providers)
- `middleware.js` - Route protection (admin/user/protected paths)
- `models/User.js` - User schema with resetToken fields

## 🔐 User Model Fields

```javascript
{
  email: String (unique, required),
  name: String,
  username: String (required),
  hashedPassword: String (select: false),
  role: String (enum: ["user", "admin"], default: "user"),
  image: String,
  resetToken: String (select: false),
  resetTokenExpiry: Date (select: false),
  bookmarks: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Usage

### Sign Up

```
POST /api/auth/signup
Body: { name, email, password }
Response: { message, user: { id, name, email, role, image } }
```

### Login

- Credentials: Use email + password via NextAuth
- Google: OAuth flow redirects to dashboard

### Password Reset Flow

1. User submits email at `/forgot-password`
2. API generates token, saves to DB (1 hour expiry)
3. Reset link: `/reset-password?token=...`
4. User sets new password
5. Token invalidated, password updated

### Protected Routes

- `/dashboard` - All authenticated users
- `/profile`, `/properties/add`, `/properties/saved`, `/messages` - Authenticated
- `/admin/**` - Admin role only
- `/user/**` - Authenticated users only

## 📧 Email Integration (TODO)

Currently logs reset links to console. In production:

```javascript
// In forgot-password/route.js
import { sendEmail } from "@/lib/email";

await sendEmail({
  to: user.email,
  subject: "Password Reset Request",
  html: `<a href="${resetUrl}">Reset your password</a>`,
});
```

Recommended services:

- SendGrid
- Resend
- AWS SES
- Postmark

## 🔒 Security Notes

1. **Rate Limiting**: Forgot password limited to 3 attempts per 15 min per email
2. **No Email Enumeration**: Always returns success even if email not found
3. **Secure Tokens**: 32-byte crypto random hex strings
4. **Password Validation**: Min 6 chars, max 128 chars
5. **Error Handling**: Production errors don't leak internal details
6. **Token Expiry**: Reset tokens expire after 1 hour
7. **Single Use**: Tokens cleared after successful reset

## 🧪 Testing Flow

1. **Signup**: Visit `/signup`, create account with email/password or Google
2. **Login**: Visit `/login`, authenticate and redirect to `/dashboard`
3. **Forgot Password**: Visit `/forgot-password`, submit email, check console for reset link
4. **Reset Password**: Click link from console, set new password
5. **Login Again**: Use new password to verify reset worked

## ⚙️ Environment Variables Required

```env
NEXT_PUBLIC_DOMAIN=http://localhost:3000
NEXT_PUBLIC_API_DOMAIN=http://localhost:3000/api
MONGODB_URL=mongodb+srv://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=... (generate with: openssl rand -base64 32)
```

## 📝 Future Enhancements

- [ ] Email verification on signup
- [ ] 2FA/MFA support
- [ ] Password strength indicator
- [ ] Remember me functionality
- [ ] Account deletion
- [ ] Session management dashboard
- [ ] OAuth providers (GitHub, Twitter, etc.)
- [ ] Rate limiting with Redis
- [ ] Login history/audit log

## 🛠️ Helper Functions

```javascript
// utils/authHelpers.js
hashPassword(password); // Hash with bcrypt
verifyPassword(password, hash); // Compare password
generateResetToken(); // Secure 32-byte hex token
generateResetTokenExpiry(); // Date 1 hour from now
isTokenExpired(date); // Check if token expired
validatePassword(password); // Validate strength
validateSignupData(data); // Validate signup form
normalizeEmail(email); // Lowercase + trim
getSafeErrorMessage(error, fallback); // Safe error messages
```

## 📚 Error Messages

All error messages are user-friendly and don't expose internal state:

- "An account with this email already exists"
- "Invalid email or password"
- "Reset token has expired. Please request a new one."
- "Password must be at least 6 characters"
- "Please provide a valid email address"
- "Too many reset attempts. Please try again later."

## ✨ Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use Redis for rate limiting
- [ ] Implement email service
- [ ] Add HTTPS
- [ ] Enable CSRF protection
- [ ] Set secure cookie flags
- [ ] Add logging/monitoring
- [ ] Backup database regularly
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Limit password reset attempts globally
- [ ] Add CAPTCHA to prevent abuse
