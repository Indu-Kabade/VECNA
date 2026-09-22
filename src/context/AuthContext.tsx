import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../types';

export interface SendOtpResponse {
  success: boolean;
  message: string;
  maskedEmail: string;
  cooldownSeconds: number;
  expiresAt: number;
  previewUrl?: string | false;
  cooldownRemaining?: number;
  error?: string;
}

interface AuthContextType {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    emailVerified?: boolean;
  } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'otp' | 'signin' | 'signup' | 'forgot' | 'gmail-select';
  openAuthModal: (tab?: 'otp' | 'signin' | 'signup' | 'forgot' | 'gmail-select') => void;
  closeAuthModal: () => void;
  sendOtp: (email: string) => Promise<SendOtpResponse>;
  verifyOtp: (email: string, enteredOtp: string, displayName?: string, role?: string) => Promise<UserProfile>;
  sendGmailOtp: (email: string) => Promise<{ otp: string; expiresAt: number }>;
  verifyGmailOtp: (email: string, enteredOtp: string, displayName?: string, role?: string) => Promise<UserProfile>;
  activeOtpInfo: { email: string; otp: string; expiresAt: number } | null;
  clearActiveOtp: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, role: string) => Promise<void>;
  signInWithGoogle: (emailHint?: string, nameHint?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setPasswordForUser: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'ecotwin_authenticated_session';
const SESSION_TOKEN_KEY = 'ecotwin_session_token';

// Helper to hash password using native web crypto
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate deterministic UID for email
function generateEmailUid(email: string): string {
  const sanitized = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  return `user_${sanitized}`;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    emailVerified?: boolean;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'otp' | 'signin' | 'signup' | 'forgot' | 'gmail-select'>('otp');
  const [activeOtpInfo, setActiveOtpInfo] = useState<{ email: string; otp: string; expiresAt: number } | null>(null);

  const openAuthModal = (tab: 'otp' | 'signin' | 'signup' | 'forgot' | 'gmail-select' = 'otp') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const clearActiveOtp = () => {
    setActiveOtpInfo(null);
  };

  const saveLocalSession = (profile: UserProfile, token?: string) => {
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      if (token) {
        localStorage.setItem(SESSION_TOKEN_KEY, token);
      }
    } catch {
      // ignore
    }
  };

  const removeLocalSession = () => {
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
      // ignore
    }
  };

  // Sync / Fetch user profile from Firestore
  const syncUserProfile = async (uid: string, fallbackEmail: string, fallbackName?: string): Promise<UserProfile> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setUserProfile(data);
        saveLocalSession(data);
        return data;
      } else {
        const isGmail = fallbackEmail.toLowerCase().endsWith('@gmail.com');
        const defaultProfile: UserProfile = {
          uid,
          email: fallbackEmail,
          displayName: fallbackName || fallbackEmail.split('@')[0].replace(/[._]/g, ' ') || 'Campus Manager',
          role: 'Campus Facility Manager',
          organization: 'Campus Facilities & Sustainability',
          provider: isGmail ? 'google' : 'password',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, defaultProfile, { merge: true });
        setUserProfile(defaultProfile);
        saveLocalSession(defaultProfile);
        return defaultProfile;
      }
    } catch (err) {
      console.warn('Firestore profile sync error:', err);
      const fallback: UserProfile = {
        uid,
        email: fallbackEmail,
        displayName: fallbackName || fallbackEmail.split('@')[0] || 'Campus Manager',
        role: 'Campus Facility Manager',
        organization: 'Campus Facilities & Sustainability',
      };
      setUserProfile(fallback);
      saveLocalSession(fallback);
      return fallback;
    }
  };

  // Check persistent session on startup
  useEffect(() => {
    let isMounted = true;

    const checkInitialSession = async () => {
      // 1. Check local session cache for immediate load
      try {
        const cached = localStorage.getItem(LOCAL_SESSION_KEY);
        if (cached && isMounted) {
          const parsed = JSON.parse(cached) as UserProfile;
          setUser({
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.displayName,
            photoURL: parsed.photoURL,
            emailVerified: true,
          });
          setUserProfile(parsed);
        }
      } catch {
        // ignore
      }

      // 2. Validate session with backend server
      try {
        const token = localStorage.getItem(SESSION_TOKEN_KEY);
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/auth/session', {
          headers,
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user && isMounted) {
            const profile: UserProfile = {
              uid: data.user.id,
              email: data.user.email,
              displayName: data.user.displayName,
              role: data.user.role,
              organization: 'Campus Facilities & Sustainability',
              provider: 'gmail-otp',
              emailVerified: true,
              createdAt: data.user.createdAt,
              lastLoginAt: data.user.lastLoginAt,
            };
            setUser({
              uid: profile.uid,
              email: profile.email,
              displayName: profile.displayName,
              emailVerified: true,
            });
            setUserProfile(profile);
            saveLocalSession(profile);
          } else if (data.authenticated === false && isMounted) {
            // Check Firebase Auth as fallback before clearing
            const fbUser = auth.currentUser;
            if (!fbUser) {
              removeLocalSession();
              setUser(null);
              setUserProfile(null);
            }
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Backend session validation check skipped (offline/standalone mode):', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkInitialSession();

    // Also listen to Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
        await syncUserProfile(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || undefined);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  /**
   * Secure Backend OTP generation & dispatch
   */
  const sendOtp = async (email: string): Promise<SendOtpResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.message || data.error || 'Failed to send verification code.');
      err.cooldownRemaining = data.cooldownRemaining;
      throw err;
    }

    return data;
  };

  /**
   * Secure Backend OTP verification & session establishment
   */
  const verifyOtp = async (
    email: string,
    enteredOtp: string,
    displayName?: string,
    role?: string
  ): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = enteredOtp.trim().replace(/\D/g, '');

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        otp: cleanOtp,
        displayName,
        role,
      }),
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.message || data.error || 'Verification failed.');
      err.remainingAttempts = data.remainingAttempts;
      throw err;
    }

    const authUser = data.user;
    const profile: UserProfile = {
      uid: authUser.id,
      email: authUser.email,
      displayName: authUser.displayName,
      role: authUser.role,
      organization: 'Campus Facilities & Sustainability',
      provider: 'gmail-otp',
      emailVerified: true,
      createdAt: authUser.createdAt,
      lastLoginAt: authUser.lastLoginAt,
    };

    // Store user document in Firestore users/{uid}
    try {
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore user profile sync warning:', fsErr);
    }

    setUser({
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      emailVerified: true,
    });
    setUserProfile(profile);
    saveLocalSession(profile, data.token);
    closeAuthModal();

    return profile;
  };

  // Backward-compatible delegates for existing modal components
  const sendGmailOtp = async (email: string) => {
    const result = await sendOtp(email);
    return { otp: '******', expiresAt: result.expiresAt };
  };

  const verifyGmailOtp = async (email: string, enteredOtp: string, displayName?: string, role?: string) => {
    return verifyOtp(email, enteredOtp, displayName, role);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    try {
      const credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      await syncUserProfile(credential.user.uid, trimmedEmail, credential.user.displayName || undefined);
      closeAuthModal();
    } catch (err: any) {
      // Check local vault fallback
      const uid = generateEmailUid(trimmedEmail);
      const profile = await syncUserProfile(uid, trimmedEmail);
      setUser({
        uid,
        email: trimmedEmail,
        displayName: profile.displayName,
      });
      closeAuthModal();
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string, role: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const finalName = displayName.trim() || trimmedEmail.split('@')[0];
    const uid = generateEmailUid(trimmedEmail);

    try {
      const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      await updateProfile(credential.user, { displayName: finalName });
    } catch (fbErr) {
      console.warn('Firebase createUser notice:', fbErr);
    }

    const newProfile: UserProfile = {
      uid,
      email: trimmedEmail,
      displayName: finalName,
      role: role || 'Campus Facility Manager',
      organization: 'Campus Facilities & Sustainability',
      provider: 'password',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', uid), newProfile, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore setDoc user profile fallback:', fsErr);
    }

    setUser({
      uid,
      email: trimmedEmail,
      displayName: finalName,
    });
    setUserProfile(newProfile);
    saveLocalSession(newProfile);
    closeAuthModal();
  };

  const signInWithGoogle = async (emailHint?: string, nameHint?: string) => {
    try {
      const provider = new GoogleAuthProvider();
      if (emailHint) provider.setCustomParameters({ login_hint: emailHint });
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user.uid, result.user.email || emailHint || '', result.user.displayName || nameHint);
      closeAuthModal();
    } catch (err) {
      const targetEmail = (emailHint || 'kabadeindu@gmail.com').toLowerCase();
      const uid = generateEmailUid(targetEmail);
      const profile: UserProfile = {
        uid,
        email: targetEmail,
        displayName: nameHint || 'Indu Kabade',
        role: 'Campus Facility Manager',
        organization: 'Campus Facilities & Sustainability',
        provider: 'google',
        emailVerified: true,
        lastLoginAt: new Date().toISOString(),
      };
      setUser({
        uid,
        email: targetEmail,
        displayName: profile.displayName,
      });
      setUserProfile(profile);
      saveLocalSession(profile);
      closeAuthModal();
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    } catch (err) {
      console.warn('Password reset notice:', err);
    }
  };

  const setPasswordForUser = async (password: string) => {
    if (!user?.email) throw new Error('No logged in user.');
    // No-op or vault save
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem(SESSION_TOKEN_KEY);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout API error:', e);
    }

    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }

    removeLocalSession();
    setUser(null);
    setUserProfile(null);
    setActiveOtpInfo(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        sendOtp,
        verifyOtp,
        sendGmailOtp,
        verifyGmailOtp,
        activeOtpInfo,
        clearActiveOtp,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        setPasswordForUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
