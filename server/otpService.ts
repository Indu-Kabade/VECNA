import crypto from 'node:crypto';
import { sendOtpEmail } from './emailService';

export interface StoredOtpRecord {
  id: string;
  email: string;
  otpHash: string;
  salt: string;
  expiresAt: number; // 5 minutes from creation
  attempts: number; // max 5 incorrect attempts
  createdAt: number;
  verifiedAt: number | null;
  cooldownUntil: number; // 60 seconds from creation
}

// In-memory persistent record map keyed by normalized email
const otpStorage = new Map<string, StoredOtpRecord>();

// Periodic cleanup of expired records older than 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStorage.entries()) {
    if (now > record.expiresAt + 10 * 60 * 1000) {
      otpStorage.delete(email);
    }
  }
}, 60 * 1000);

const SALT_SECRET = process.env.SESSION_SECRET || 'ecotwin-default-salt-2026';

/**
 * Computes a SHA-256 hash of the OTP with a per-record salt and system secret
 */
export function hashOtp(otp: string, salt: string): string {
  return crypto
    .createHash('sha256')
    .update(`${otp}:${salt}:${SALT_SECRET}`)
    .digest('hex');
}

/**
 * Generates a cryptographically secure 6-digit OTP string
 */
export function generateCryptographicOtp(): string {
  // Generates an integer in [100000, 999999] using OS cryptographic entropy
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Masks an email for safe display (e.g., k***u@gmail.com)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }
  const first = localPart[0];
  const last = localPart[localPart.length - 1];
  return `${first}${'*'.repeat(Math.min(localPart.length - 2, 4))}${last}@${domain}`;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  maskedEmail: string;
  cooldownSeconds: number;
  expiresAt: number;
  previewUrl?: string | false;
  error?: string;
  cooldownRemaining?: number;
}

/**
 * Generates, hashes, stores, and emails an OTP
 */
export async function sendOtp(emailInput: string): Promise<SendOtpResult> {
  const email = emailInput.toLowerCase().trim();
  const now = Date.now();

  // Check 60-second cooldown
  const existing = otpStorage.get(email);
  if (existing && now < existing.cooldownUntil) {
    const remaining = Math.ceil((existing.cooldownUntil - now) / 1000);
    return {
      success: false,
      message: `Please wait ${remaining} seconds before requesting a new code.`,
      maskedEmail: maskEmail(email),
      cooldownSeconds: remaining,
      cooldownRemaining: remaining,
      expiresAt: existing.expiresAt,
      error: 'RESEND_COOLDOWN_ACTIVE',
    };
  }

  // Generate cryptographically secure 6-digit OTP
  const rawOtp = generateCryptographicOtp();
  const salt = crypto.randomBytes(16).toString('hex');
  const hashed = hashOtp(rawOtp, salt);

  const expiresAt = now + 5 * 60 * 1000; // 5 minutes
  const cooldownUntil = now + 60 * 1000; // 60 seconds

  const record: StoredOtpRecord = {
    id: `otp_${now}_${crypto.randomBytes(6).toString('hex')}`,
    email,
    otpHash: hashed,
    salt,
    expiresAt,
    attempts: 0,
    createdAt: now,
    verifiedAt: null,
    cooldownUntil,
  };

  otpStorage.set(email, record);

  // Send real email via secure Nodemailer / SMTP
  const emailResult = await sendOtpEmail({
    email,
    otp: rawOtp,
    expiresInMinutes: 5,
  });

  if (!emailResult.success) {
    console.error(`[OtpService] Failed to send email to ${email}:`, emailResult.error);
    return {
      success: false,
      message: `Failed to deliver verification code to ${maskEmail(email)}. Please check mail configuration or try again.`,
      maskedEmail: maskEmail(email),
      cooldownSeconds: 0,
      expiresAt,
      error: emailResult.error || 'EMAIL_SENDING_FAILED',
    };
  }

  return {
    success: true,
    message: `Verification code sent to ${maskEmail(email)}. Valid for 5 minutes.`,
    maskedEmail: maskEmail(email),
    cooldownSeconds: 60,
    expiresAt,
    previewUrl: emailResult.previewUrl,
  };
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  remainingAttempts?: number;
  error?: string;
  record?: StoredOtpRecord;
}

/**
 * Server-side verification with attempt counting, timing-safe equality, and invalidation
 */
export function verifyOtp(emailInput: string, enteredOtpInput: string): VerifyOtpResult {
  const email = emailInput.toLowerCase().trim();
  const enteredOtp = (enteredOtpInput || '').trim();
  const now = Date.now();

  const record = otpStorage.get(email);
  if (!record) {
    return {
      success: false,
      message: 'No active verification code found for this email. Please request a new code.',
      error: 'OTP_NOT_FOUND',
    };
  }

  // Check already verified (prevention of reuse)
  if (record.verifiedAt !== null) {
    return {
      success: false,
      message: 'This verification code has already been used. Please request a new code.',
      error: 'OTP_ALREADY_USED',
    };
  }

  // Check expiration (5-minute rule)
  if (now > record.expiresAt) {
    otpStorage.delete(email);
    return {
      success: false,
      message: 'This verification code has expired (valid for 5 minutes). Please request a new code.',
      error: 'OTP_EXPIRED',
    };
  }

  // Check attempt limit (max 5 failed attempts)
  if (record.attempts >= 5) {
    otpStorage.delete(email);
    return {
      success: false,
      message: 'Maximum verification attempts exceeded (5/5). This code has been invalidated for security. Please request a new code.',
      remainingAttempts: 0,
      error: 'MAX_ATTEMPTS_EXCEEDED',
    };
  }

  // Compute hash of entered OTP using stored salt
  const candidateHash = hashOtp(enteredOtp, record.salt);

  // Timing-safe comparison to prevent side-channel timing attacks
  const candidateBuffer = Buffer.from(candidateHash, 'hex');
  const storedBuffer = Buffer.from(record.otpHash, 'hex');

  const matches =
    candidateBuffer.length === storedBuffer.length &&
    crypto.timingSafeEqual(candidateBuffer, storedBuffer);

  if (!matches) {
    record.attempts += 1;
    const remaining = Math.max(0, 5 - record.attempts);

    if (record.attempts >= 5) {
      otpStorage.delete(email);
      return {
        success: false,
        message: 'Incorrect code. Maximum attempts (5/5) reached. This code is now invalidated.',
        remainingAttempts: 0,
        error: 'MAX_ATTEMPTS_EXCEEDED',
      };
    }

    return {
      success: false,
      message: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      remainingAttempts: remaining,
      error: 'INVALID_OTP',
    };
  }

  // Mark as verified and invalidate
  record.verifiedAt = now;

  return {
    success: true,
    message: 'OTP verified successfully.',
    record,
  };
}
