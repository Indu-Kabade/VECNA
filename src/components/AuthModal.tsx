import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Briefcase, 
  Copy, 
  Check, 
  Send, 
  KeyRound, 
  Sparkles,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VecnaLogo } from './VecnaLogo';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    authModalTab, 
    closeAuthModal, 
    sendGmailOtp,
    verifyGmailOtp,
    activeOtpInfo,
    clearActiveOtp,
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle,
    resetPassword 
  } = useAuth();

  // Active tab: 'otp' | 'signin' | 'signup' | 'forgot'
  const [activeTab, setActiveTab] = useState<'otp' | 'signin' | 'signup' | 'forgot'>('otp');

  // OTP flow states
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [gmailAddress, setGmailAddress] = useState('kabadeindu@gmail.com');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password / Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('Campus Facility Manager');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync tab from context when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      if (authModalTab === 'signin') {
        setActiveTab('signin');
      } else if (authModalTab === 'signup') {
        setActiveTab('signup');
      } else if (authModalTab === 'forgot') {
        setActiveTab('forgot');
      } else {
        setActiveTab('otp');
      }

      setErrorMessage(null);
      setSuccessMessage(null);
      setCopiedCode(false);

      if (!gmailAddress) {
        setGmailAddress('kabadeindu@gmail.com');
      }
      if (!email) {
        setEmail('kabadeindu@gmail.com');
      }

      // If active OTP exists for this email and is still valid, resume verify step
      if (activeOtpInfo && activeOtpInfo.email === gmailAddress && Date.now() < activeOtpInfo.expiresAt) {
        setOtpStep('verify');
      } else {
        setOtpStep('request');
      }
    }
  }, [isAuthModalOpen, authModalTab]);

  // Resend cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  // Password strength helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Too short (min 6 chars)', color: 'bg-red-500' };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    const score = (hasLetters ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSpecial ? 1 : 0);
    if (score === 1) return { score: 2, label: 'Weak', color: 'bg-amber-500' };
    if (score === 2) return { score: 3, label: 'Good', color: 'bg-emerald-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-600' };
  };

  const passwordStrength = getPasswordStrength(password);

  const formatAuthError = (err: unknown): string => {
    const errorStr = String(err);
    if (errorStr.includes('Incorrect password') || errorStr.includes('auth/wrong-password') || errorStr.includes('auth/invalid-credential')) {
      return 'Incorrect password. You can also sign in via Gmail OTP without entering a password.';
    }
    if (errorStr.includes('auth/email-already-in-use')) {
      return 'An account with this email address already exists. Please sign in or use Gmail OTP.';
    }
    if (errorStr.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters long.';
    }
    if (errorStr.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    return (err instanceof Error ? err.message : 'Authentication failed. Please try again.');
  };

  // -------------------------------------------------------------
  // OTP LOGIC
  // -------------------------------------------------------------
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = gmailAddress.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail address to receive the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendGmailOtp(targetEmail);
      setOtpStep('verify');
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(`A 6-digit verification code has been dispatched to ${targetEmail}.`);
      
      // Auto-focus first input box after render
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (!cleaned) {
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Handle single character
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto-focus next input box
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Focus last filled index or submit if all 6 filled
    const nextEmptyIndex = newDigits.findIndex(d => !d);
    if (nextEmptyIndex === -1) {
      otpInputRefs.current[5]?.focus();
    } else {
      otpInputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    if (activeOtpInfo?.otp) {
      const codeArr = activeOtpInfo.otp.split('');
      setOtpDigits(codeArr);
      setErrorMessage(null);
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleCopyCode = () => {
    if (activeOtpInfo?.otp) {
      navigator.clipboard.writeText(activeOtpInfo.otp);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyGmailOtp(gmailAddress, fullOtp);
      setSuccessMessage('Verification successful! Authenticated with verified Gmail.');
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // PASSWORD SIGN IN & SIGN UP
  // -------------------------------------------------------------
  const handleSignInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password || !displayName.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('Please accept the campus data governance terms to continue.');
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, displayName, role);
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address to receive password reset instructions.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setSuccessMessage(`Password recovery instructions sent to ${email}. Check your inbox.`);
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={closeAuthModal}
    >
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <VecnaLogo size={32} showBackground={true} />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                VECNA Secure Auth
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight pt-1">
              {activeTab === 'otp' && (otpStep === 'request' ? 'Sign in with Gmail' : 'Verify One-Time Passcode')}
              {activeTab === 'signin' && 'Sign in with Password'}
              {activeTab === 'signup' && 'Create Campus Account'}
              {activeTab === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === 'otp' && (
                otpStep === 'request' 
                  ? 'Enter your Gmail address to receive a secure 6-digit OTP code'
                  : `Enter the 6-digit verification code sent to ${gmailAddress}`
              )}
              {activeTab === 'signin' && 'Sign in using your account email and password'}
              {activeTab === 'signup' && 'Create a verified campus profile with email and password'}
              {activeTab === 'forgot' && 'Enter your email to receive recovery instructions'}
            </p>
          </div>

          <button
            id="close-auth-modal-btn"
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Gmail OTP vs Password vs Create Account) */}
        {activeTab !== 'forgot' && (
          <div className="px-6 pt-3 shrink-0">
            <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                id="tab-otp-btn"
                onClick={() => {
                  setActiveTab('otp');
                  setErrorMessage(null);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'otp'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Gmail OTP</span>
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded-md font-extrabold">
                  Instant
                </span>
              </button>

              <button
                type="button"
                id="tab-signin-btn"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Password
              </button>

              <button
                type="button"
                id="tab-signup-btn"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: GMAIL OTP AUTHENTICATION                                 */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'otp' && (
            <div className="space-y-4">
              {/* STEP 1: REQUEST OTP */}
              {otpStep === 'request' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Gmail address input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Gmail Address
                    </label>
                    <div className="relative">
                      {/* Google icon */}
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                      <input
                        id="gmail-otp-input"
                        type="email"
                        required
                        autoFocus
                        placeholder="yourname@gmail.com"
                        value={gmailAddress}
                        onChange={(e) => setGmailAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Quick Email Selection Pill */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400 font-medium">Quick select:</span>
                    <button
                      type="button"
                      onClick={() => setGmailAddress('kabadeindu@gmail.com')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        gmailAddress === 'kabadeindu@gmail.com'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      kabadeindu@gmail.com
                    </button>
                  </div>

                  {/* Information banner */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Passwordless Two-Factor Security</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      We generate an encrypted 6-digit one-time passcode. No password needed — just verify the code to immediately access the campus digital twin.
                    </p>
                  </div>

                  {/* Send OTP CTA */}
                  <button
                    type="submit"
                    id="send-otp-submit-btn"
                    disabled={isLoading || !gmailAddress.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching 6-Digit Code...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send 6-Digit OTP Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Alternative Google 1-click fallback */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      id="google-popup-fallback-btn"
                      onClick={() => signInWithGoogle(gmailAddress)}
                      className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Or sign in via standard Google Account popup</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: VERIFY OTP */}
              {otpStep === 'verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
                  {/* Destination summary & change address */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                        G
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block leading-none">
                          Delivered to
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                          {gmailAddress}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('request');
                        setErrorMessage(null);
                      }}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  {/* LIVE SECURITY DISPATCH CARD (Simulates email inbox delivery in development) */}
                  {activeOtpInfo && activeOtpInfo.email === gmailAddress.trim().toLowerCase() && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 border-2 border-emerald-500/50 shadow-lg text-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <Mail className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>Incoming Verification Code</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Valid 10m
                        </span>
                      </div>

                      {/* Displayed 6-digit Code */}
                      <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-emerald-500/30">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Your 6-Digit OTP
                          </div>
                          <div className="text-2xl font-black font-mono tracking-[0.25em] text-emerald-300">
                            {activeOtpInfo.otp}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            id="autofill-otp-btn"
                            onClick={handleAutoFillOtp}
                            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Auto-Fill</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6 INDIVIDUAL PIN INPUT BOXES */}
                  <div className="space-y-2">
                    <label className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      Enter the 6-digit passcode
                    </label>

                    <div 
                      className="flex items-center justify-center gap-2 sm:gap-2.5"
                      onPaste={handleOtpPaste}
                    >
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          id={`otp-digit-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-black rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-xs"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend OTP Timer & Actions */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={() => handleSendOtp()}
                      className={`font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                        resendCooldown > 0
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-emerald-600 dark:text-emerald-400 hover:underline'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? (
                        <span>Resend OTP in {resendCooldown}s</span>
                      ) : (
                        <span>Resend Code</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('request');
                        setErrorMessage(null);
                      }}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer font-medium"
                    >
                      Back to email
                    </button>
                  </div>

                  {/* Verify OTP CTA */}
                  <button
                    type="submit"
                    id="verify-otp-submit-btn"
                    disabled={isLoading || otpDigits.join('').length !== 6}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Passcode...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify OTP & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: PASSWORD SIGN IN                                        */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignInWithPassword} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email / Gmail Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signin-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="kabadeindu@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Remember me on this browser
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-signin-btn"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In With Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to OTP helper */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('otp')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  Prefer passwordless login? Sign in with Gmail OTP →
                </button>
              </div>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: CREATE ACCOUNT / REGISTER                               */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpWithPassword} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    placeholder="Indu Kabade"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Facility Role */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Campus Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    id="signup-role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Campus Facility Manager">Campus Facility Manager</option>
                    <option value="Sustainability Lead">Sustainability Lead</option>
                    <option value="HVAC Operations Specialist">HVAC Operations Specialist</option>
                    <option value="Plumbing & Water Supervisor">Plumbing & Water Supervisor</option>
                    <option value="Energy & Utilities Auditor">Energy & Utilities Auditor</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Gmail or Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="kabadeindu@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Strength</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Policy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                    I agree to the Campus Facility Data Governance and Energy Management Policy.
                  </span>
                </label>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                id="submit-signup-btn"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Account & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: FORGOT PASSWORD                                         */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                Enter your Gmail or registered email address to receive password reset instructions.
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    placeholder="kabadeindu@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="submit-forgot-btn"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending email...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('otp');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Return to Gmail OTP Login
              </button>
            </form>
          )}
        </div>

        {/* Footer Security Assurance */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Firebase Security</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            OTP Verified Service
          </span>
        </div>
      </div>
    </div>
  );
};
