# Authentication Issues - Diagnosis & Fixes

## Issues Identified

### 1. **Double Toast Messages on Signup**

**Problem**: Success toast appears, then "Invalid email or password" error
**Root Cause**: Race condition between account creation and immediate signin attempt
**Fix Applied**: Added 500ms delay after signup before signin attempt to allow DB commit

### 2. **Login Fails After Signup**

**Problem**: Newly created credentials don't work for login
**Root Cause**: Password might not be properly hashed/saved OR email normalization mismatch
**Fix Applied**:

- Added extensive logging to track the flow
- Added verification step after user creation
- Improved error messages with console logging

### 3. **Password Reset Link Not Visible**

**Problem**: User says "no reset link is sent"
**Root Cause**: Reset link logs to SERVER console, not browser
**Fix Applied**: Added clear documentation and debug page

## How to Debug

### Step 1: Test Signup Flow

1. Visit `/auth-debug` page
2. Enter email and password
3. Click "Test Signup"
4. Check BOTH:
   - Browser console (F12)
   - Server terminal where `npm run dev` is running

### Step 2: Check Server Logs

When you run signup, you should see in the SERVER terminal:

```
Creating user with email: test@example.com
Hashed password length: 60
User created successfully with ID: 507f1f77bcf86cd799439011
Verification - User has password: Yes
```

### Step 3: Test Login

After signup succeeds, try logging in. Check SERVER terminal for:

```
Looking up user with email: test@example.com
User found: Yes
Has password: Yes
Password valid: true
```

### Step 4: Test Password Reset

1. Visit `/forgot-password`
2. Submit your email
3. Check SERVER terminal (NOT browser) for:

```
Password reset link: http://localhost:3000/reset-password?token=abc123...
Token expires at: 2025-12-11T15:30:00.000Z
```

4. Copy that link and open it in browser

## Common Issues & Solutions

### Issue: "Invalid email or password" immediately after signup

**Solution**:

- Clear browser cache and cookies
- Wait 1-2 seconds after seeing "Account created successfully"
- Try manually going to `/login` and entering credentials

### Issue: Login always fails even though signup succeeded

**Check**:

1. Open MongoDB Compass or shell
2. Find your user: `db.users.findOne({ email: "your@email.com" })`
3. Check if `hashedPassword` field exists
4. If missing, the password wasn't saved - check server logs for errors

### Issue: No reset link received

**Understand**:

- Reset links print to SERVER console (terminal)
- NOT sent to browser or email (email sending not implemented yet)
- Look at the terminal where `npm run dev` runs
- Copy the link manually from there

### Issue: Email case sensitivity

**Solution**:

- Always use lowercase emails
- System auto-normalizes but be consistent
- If you signed up with "Test@Example.com", login with "test@example.com"

## Quick Fixes to Try

### Fix 1: Clear All Auth State

```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
// Then hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

### Fix 2: Manual Database Check

```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Check user
db.users.findOne({ email: "test@example.com" })

# Should see hashedPassword field (60 chars starting with $2a$)
```

### Fix 3: Test with Debug Page

1. Go to `/auth-debug`
2. Use a NEW email you haven't tried
3. Test signup
4. Read all logs carefully
5. Try password reset test

## Expected Behavior

### Successful Signup Flow:

1. Fill form and submit
2. See "Account created successfully! Signing you in..."
3. Brief pause (500ms)
4. See "Welcome! Redirecting to dashboard..."
5. Redirected to `/dashboard`

### Successful Login Flow:

1. Enter credentials
2. See "Welcome back!"
3. Redirected to `/dashboard`

### Successful Reset Flow:

1. Visit `/forgot-password`
2. Enter email
3. See success message
4. Check SERVER console for link
5. Copy link to browser
6. Enter new password
7. See "Password has been reset successfully"
8. Auto-redirect to `/login` after 2 seconds

## Logging Locations

| Event                 | Where to Check  |
| --------------------- | --------------- |
| Signup API            | Server terminal |
| User creation         | Server terminal |
| Password hashing      | Server terminal |
| Login attempt         | Server terminal |
| Password verification | Server terminal |
| Reset link generation | Server terminal |
| Form validation       | Browser console |
| NextAuth errors       | Browser console |

## Development Mode Logging

All console.log statements are active. You should see:

- Server: Detailed auth flow logs
- Browser: Result of signin attempts
- Both: Error messages with context

## Production Checklist

Before going to production:

1. Remove all console.log statements
2. Delete `/auth-debug` page
3. Implement actual email sending (SendGrid/Resend/SES)
4. Use environment variable to control debug logging
5. Remove password logging (never log passwords!)

## Need More Help?

1. Share SERVER terminal output (where npm run dev runs)
2. Share browser console output (F12 > Console tab)
3. Describe exact steps you took
4. Note which email you used for testing
