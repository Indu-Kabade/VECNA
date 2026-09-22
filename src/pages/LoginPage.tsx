import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  Lock, 
  CheckCircle2, 
  KeyRound, 
  Building2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VecnaLogo } from '../components/VecnaLogo';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { sendOtp, verifyOtp, user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState<string>('kabadeindu@gmail.com');
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('Indu Kabade');
  
  // 6 separate OTP input boxes
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // 60-second resend cooldown timer
  const [cooldown, setCooldown] = useState<number>(0);
  // Remaining verification attempts (starts at 5)
  const [remainingAttempts, setRemainingAttempts] = useState<number>(5);

  // Cooldown countdown interval
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus first input when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setPreviewUrl(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOtp(cleanEmail);
      if (result.success) {
        setMaskedEmail(result.maskedEmail || cleanEmail);
        setCooldown(result.cooldownSeconds || 60);
        setRemainingAttempts(5);
        setOtpDigits(['', '', '', '', '', '']);
        setStep('otp');
        setSuccessNotice(`Verification code dispatched to ${result.maskedEmail}. Valid for 5 minutes.`);
        if (result.previewUrl) {
          setPreviewUrl(result.previewUrl);
        }
      } else {
        setError(result.message || 'Failed to send verification code.');
        if (result.cooldownRemaining) {
          setCooldown(result.cooldownRemaining);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Could not connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit change
  const handleDigitChange = (index: number, value: string) => {
    setError(null);
    const cleaned = value.replace(/\D/g, '');

    // If user pasted multi-digit string (e.g. 6 digits)
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      chars.forEach((c, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = c;
        }
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(index + chars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(0, 1);
    setOtpDigits(newDigits);

    // Auto-advance focus to next box
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace and Arrow keys
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste directly on input
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    pastedData.split('').forEach((char, idx) => {
      if (idx < 6) newDigits[idx] = char;
    });
    setOtpDigits(newDigits);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await verifyOtp(cleanEmail, fullOtp, displayName, 'Campus Facility Manager');
      setSuccessNotice('Identity verified successfully! Redirecting to Digital Twin dashboard...');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Invalid verification code.';
      setError(msg);
      
      // Parse remaining attempts from error if present
      if (err.remainingAttempts !== undefined) {
        setRemainingAttempts(err.remainingAttempts);
      } else {
        setRemainingAttempts((prev) => Math.max(0, prev - 1));
      }
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otpDigits.every((d) => d.length === 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-emerald-950/20">
          
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="mb-3.5 relative">
              <div className="absolute -inset-2 bg-emerald-500/20 rounded-2xl blur-lg" />
              <VecnaLogo size={46} showBackground={true} />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-bold tracking-wide uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographic Email OTP Login</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              VECNA Digital Twin
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              AI-driven campus facility intelligence, anomaly detection, and energy verification.
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">{error}</span>
                {remainingAttempts < 5 && remainingAttempts > 0 && (
                  <div className="mt-1 text-[11px] text-rose-400 font-bold">
                    Warning: {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining before code lock.
                  </div>
                )}
              </div>
            </div>
          )}

          {successNotice && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">{successNotice}</span>
                {previewUrl && (
                  <div className="mt-1.5">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 underline font-bold"
                    >
                      <span>View Test Mail Delivery Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: EMAIL ENTRY */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Facility Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com or campus.facility@edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Authorized staff access only</span>
                  <button
                    type="button"
                    onClick={() => setEmail('kabadeindu@gmail.com')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-colors"
                  >
                    Use Demo Email
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Indu Kabade"
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating & Dispatching Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center">
                <p className="text-xs text-slate-400">
                  We sent a 6-digit verification code to
                </p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">
                  {maskedEmail || email}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError(null);
                    setSuccessNotice(null);
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-300 underline mt-1 cursor-pointer transition-colors"
                >
                  Change email address
                </button>
              </div>

              {/* 6 Individual Digit Inputs */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-300 mb-2.5">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold bg-slate-950 border rounded-xl text-white transition-all focus:outline-none ${
                        digit
                          ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 ring-1 ring-emerald-500/50'
                          : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                      aria-label={`Digit ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-slate-500" />
                    <span>Expires in 5 minutes</span>
                  </span>
                  <span className={`font-semibold ${remainingAttempts <= 2 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining
                  </span>
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || !isOtpComplete}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code Server-Side...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Launch Digital Twin</span>
                  </>
                )}
              </button>

              {/* Resend OTP with Cooldown */}
              <div className="text-center pt-2 border-t border-slate-800">
                {cooldown > 0 ? (
                  <p className="text-xs text-slate-500">
                    Resend code available in{' '}
                    <span className="text-emerald-400 font-bold font-mono">
                      {cooldown}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend Verification Code</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Security Features Architecture Footer */}
          <div className="mt-7 pt-5 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero client OTP exposure: code generated & verified server-side</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>SHA-256 salted hash storage with timing-safe comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Role-based campus session with automatic route protection</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
