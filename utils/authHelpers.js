import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Hash a password with bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a secure reset token
 * @returns {string} Random token (32 bytes hex)
 */
export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password is too long" };
  }
  return { valid: true };
}

/**
 * Sanitize error messages for client response
 * @param {Error} error
 * @param {string} fallbackMessage
 * @returns {string}
 */
export function getSafeErrorMessage(error, fallbackMessage = "An error occurred") {
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === "production") {
    return fallbackMessage;
  }
  return error?.message || fallbackMessage;
}

/**
 * Generate a reset token expiry (1 hour from now)
 * @returns {Date}
 */
export function generateResetTokenExpiry() {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  return expiry;
}

/**
 * Check if reset token is expired
 * @param {Date} expiryDate
 * @returns {boolean}
 */
export function isTokenExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}

/**
 * Normalize email to lowercase
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  return email?.toLowerCase().trim();
}

/**
 * Validate signup data
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateSignupData(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Please provide a valid email address";
  }

  const passwordCheck = validatePassword(data.password);
  if (!passwordCheck.valid) {
    errors.password = passwordCheck.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
