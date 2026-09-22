import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { sendOtp, verifyOtp } from './server/otpService';
import { createSession, validateSession, destroySession } from './server/sessionService';

const app = express();
const PORT = 3000;

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to extract session token from Authorization header or Cookie header
function extractToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/ecotwin_session=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

// ==========================================
// API ROUTES (Mounted before Vite middleware)
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EcoTwin Digital Twin & Authentication Server',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 1. SEND OTP ENDPOINT
 * Cryptographically generates 6-digit OTP, stores secure SHA-256 hash, enforces 60s cooldown,
 * sends real email via Nodemailer/SMTP, never exposes OTP in response.
 */
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: 'Email address is required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      return;
    }

    const result = await sendOtp(email);

    if (!result.success) {
      const statusCode = result.error === 'RESEND_COOLDOWN_ACTIVE' ? 429 : 400;
      res.status(statusCode).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('[API] /api/auth/send-otp error:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while generating your verification code.',
    });
  }
});

/**
 * 2. VERIFY OTP ENDPOINT
 * Compares hashed OTP with timing-safe comparison, checks 5-minute expiry,
 * enforces max 5 attempts, invalidates code on success, creates authenticated session.
 */
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, displayName, role } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: 'Email address is required.' });
      return;
    }

    if (!otp || typeof otp !== 'string') {
      res.status(400).json({ success: false, error: 'Verification code is required.' });
      return;
    }

    const verifyResult = verifyOtp(email, otp);

    if (!verifyResult.success) {
      res.status(400).json(verifyResult);
      return;
    }

    // OTP is valid! Create server-side authenticated session
    const { token, user } = createSession(email, displayName, role);

    // Set secure HTTP-only session cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('ecotwin_session', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({
      success: true,
      message: 'Authentication successful. Session established.',
      token,
      user,
    });
  } catch (error) {
    console.error('[API] /api/auth/verify-otp error:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while verifying your code.',
    });
  }
});

/**
 * 3. GET SESSION ENDPOINT
 * Validates session token from cookie or header to persist auth across page refreshes.
 */
app.get('/api/auth/session', (req, res) => {
  try {
    const token = extractToken(req);
    const user = validateSession(token);

    if (!user) {
      res.json({ authenticated: false, user: null });
      return;
    }

    res.json({ authenticated: true, user });
  } catch (error) {
    console.error('[API] /api/auth/session error:', error);
    res.status(500).json({ authenticated: false, error: 'Failed to check session.' });
  }
});

/**
 * 4. LOGOUT ENDPOINT
 * Destroys server-side session and clears cookie.
 */
app.post('/api/auth/logout', (req, res) => {
  try {
    const token = extractToken(req);
    if (token) {
      destroySession(token);
    }

    res.clearCookie('ecotwin_session', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('[API] /api/auth/logout error:', error);
    res.status(500).json({ success: false, error: 'Failed to logout.' });
  }
});

// ==========================================
// VITE & STATIC FILE MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EcoTwin] Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
