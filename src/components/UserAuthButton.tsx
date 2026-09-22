import React, { useState, useRef, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  User, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles,
  Building,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserAuthButtonProps {
  variant?: 'header' | 'sidebar' | 'compact';
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({ variant = 'header' }) => {
  const { user, userProfile, openAuthModal, signOut, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
    );
  }

  // Not signed in state
  if (!user) {
    if (variant === 'compact') {
      return (
        <button
          type="button"
          id="sidebar-compact-signin-btn"
          onClick={() => openAuthModal('otp')}
          className="w-10 h-10 mx-auto rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
          title="Gmail OTP Login"
          aria-label="Gmail OTP Login"
        >
          <LogIn className="w-4 h-4" />
        </button>
      );
    }

    if (variant === 'sidebar') {
      return (
        <button
          type="button"
          id="sidebar-signin-trigger-btn"
          onClick={() => openAuthModal('otp')}
          className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 flex items-center justify-between text-xs font-bold transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <LogIn className="w-3.5 h-3.5" />
            </div>
            <span>Gmail OTP Login</span>
          </div>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-md font-semibold">
            OTP
          </span>
        </button>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          id="header-signin-btn"
          onClick={() => openAuthModal('otp')}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Gmail Login</span>
        </button>

        <button
          type="button"
          id="header-signup-btn"
          onClick={() => openAuthModal('signup')}
          className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
        >
          <span>Register</span>
        </button>
      </div>
    );
  }

  // User is signed in!
  const displayName = user.displayName || userProfile?.displayName || user.email?.split('@')[0] || 'Facility User';
  const roleName = userProfile?.role || 'Campus Facility Manager';
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  if (variant === 'compact') {
    return (
      <div className="relative flex justify-center" ref={dropdownRef}>
        <button
          type="button"
          id="sidebar-compact-user-btn"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
          title={`${displayName} (${roleName})`}
          aria-label="User profile"
        >
          {userInitials}
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-56 p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-2 border-b border-slate-800 mb-1.5">
              <div className="text-xs font-bold text-white truncate">{displayName}</div>
              <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Account</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full px-2.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          id="sidebar-user-menu-btn"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between text-left transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{displayName}</div>
              <div className="text-[10px] text-emerald-400 truncate">{roleName}</div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-2 border-b border-slate-800 mb-1.5">
              <div className="text-xs font-bold text-white truncate">{displayName}</div>
              <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Facility Account</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full px-2.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Header variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id="header-user-profile-btn"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/90 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer"
        aria-expanded={dropdownOpen}
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
          {userInitials}
        </div>
        <div className="hidden sm:block text-left pr-1">
          <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
            {displayName}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 leading-none truncate max-w-[120px]">
            {roleName.split(' ')[0]}
          </div>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {userInitials}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <Building className="w-3 h-3 text-slate-400" />
                <span className="truncate">{userProfile?.organization || 'Campus Facility Services'}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-3 h-3" />
                <span>{roleName}</span>
              </div>
              {user.email?.endsWith('@gmail.com') && (
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Gmail Account</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-1 pt-1.5">
            <button
              type="button"
              id="dropdown-signout-btn"
              onClick={handleSignOut}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of VECNA</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
