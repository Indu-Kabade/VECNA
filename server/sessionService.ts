import crypto from 'node:crypto';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  lastLoginAt: string;
  emailVerified: boolean;
}

export interface SessionRecord {
  token: string;
  user: AuthUser;
  createdAt: number;
  expiresAt: number; // 7 days
}

// In-memory session store keyed by session token
const sessions = new Map<string, SessionRecord>();

// User registry map keyed by normalized email
const userRegistry = new Map<string, AuthUser>();

export function createSession(emailInput: string, displayNameInput?: string, roleInput?: string): { token: string; user: AuthUser } {
  const email = emailInput.toLowerCase().trim();
  const now = Date.now();
  const isoNow = new Date(now).toISOString();

  let existingUser = userRegistry.get(email);
  if (!existingUser) {
    const sanitizedEmail = email.replace(/[^a-z0-9]/g, '_');
    existingUser = {
      id: `user_${sanitizedEmail}`,
      email,
      displayName: displayNameInput || email.split('@')[0].replace(/[._]/g, ' '),
      role: roleInput || 'Campus Facility Manager',
      createdAt: isoNow,
      lastLoginAt: isoNow,
      emailVerified: true,
    };
  } else {
    existingUser.lastLoginAt = isoNow;
    if (displayNameInput) existingUser.displayName = displayNameInput;
    if (roleInput) existingUser.role = roleInput;
  }

  userRegistry.set(email, existingUser);

  // Generate a high-entropy 256-bit cryptographically secure session token
  const token = `ecotwin_sess_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

  sessions.set(token, {
    token,
    user: existingUser,
    createdAt: now,
    expiresAt,
  });

  return { token, user: existingUser };
}

export function validateSession(token: string | undefined | null): AuthUser | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session.user;
}

export function destroySession(token: string | undefined | null): boolean {
  if (!token) return false;
  return sessions.delete(token);
}
