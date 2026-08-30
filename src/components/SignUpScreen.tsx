import React, { useState } from 'react';
import { User, Mail, Phone, Key, ChevronLeft, Check } from 'lucide-react';
import { EsportsLogo } from './EsportsLogo';

interface SignUpScreenProps {
  onSignUp: (userData: { username: string; email: string; phone: string }) => void;
  onNavigateToLogin: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSignUp,
  onNavigateToLogin,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid 11-digit mobile number');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms and Conditions');
      return;
    }

    onSignUp({ username, email, phone });
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#1c1248] via-[#120a32] to-[#0a051d] text-white flex flex-col items-center justify-between p-6 py-6 relative overflow-y-auto">
      {/* Top Bar with Back Arrow matching Screenshot 2 */}
      <div className="w-full flex items-center justify-between z-20">
        <button
          onClick={onNavigateToLogin}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer flex items-center justify-center"
          title="Back to Login"
        >
          <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
        </button>
        <span className="text-xs text-slate-400 font-rajdhani uppercase tracking-widest">BD ESPORTS MS</span>
        <div className="w-8" />
      </div>

      {/* Header section with Esports Club Logo & Title */}
      <div className="flex flex-col items-center text-center mt-0 z-10 w-full">
        <EsportsLogo size="md" className="mb-2" />

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest uppercase font-orbitron text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
          SIGN UP
        </h1>

        <p className="font-rajdhani text-base sm:text-lg text-indigo-200/90 mt-1 tracking-wide font-semibold">
          Create an account to join the club
        </p>
      </div>

      {/* Main Sign Up Form Card matching Screenshot 2 */}
      <div className="w-full max-w-md bg-[#1d1b2a]/90 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 sm:p-7 mt-4 shadow-2xl z-10">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              id="signup-username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full pl-12 pr-4 py-3 bg-[#363544] hover:bg-[#3d3c4e] focus:bg-[#403f52] border border-slate-600/40 rounded-2xl text-white placeholder-slate-400 font-rajdhani text-base font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-400/80 transition shadow-inner"
            />
          </div>

          {/* Email Address Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="signup-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3 bg-[#363544] hover:bg-[#3d3c4e] focus:bg-[#403f52] border border-slate-600/40 rounded-2xl text-white placeholder-slate-400 font-rajdhani text-base font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-400/80 transition shadow-inner"
            />
          </div>

          {/* Mobile Number Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-5 h-5" />
            </div>
            <input
              id="signup-phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile Number"
              className="w-full pl-12 pr-4 py-3 bg-[#363544] hover:bg-[#3d3c4e] focus:bg-[#403f52] border border-slate-600/40 rounded-2xl text-white placeholder-slate-400 font-rajdhani text-base font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-400/80 transition shadow-inner"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Key className="w-5 h-5" />
            </div>
            <input
              id="signup-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 bg-[#363544] hover:bg-[#3d3c4e] focus:bg-[#403f52] border border-slate-600/40 rounded-2xl text-white placeholder-slate-400 font-rajdhani text-base font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-400/80 transition shadow-inner"
            />
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <div
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded-md flex items-center justify-center border transition cursor-pointer shrink-0 ${
                agreed
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-[#363544] border-slate-600 text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-rajdhani text-sm font-semibold text-slate-200 select-none">
              I agree to the Terms and Conditions
            </span>
          </div>

          {/* Create Account Button */}
          <button
            id="signup-submit-button"
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6d28d9] via-[#2563eb] to-[#06b6d4] hover:from-[#7c3aed] hover:via-[#3b82f6] hover:to-[#22d3ee] text-white font-extrabold font-orbitron tracking-wider text-base shadow-[0_4px_20px_rgba(37,99,235,0.5)] transform active:scale-98 transition duration-200 cursor-pointer mt-2"
          >
            CREATE ACCOUNT
          </button>

          {/* Already have account footer */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-rajdhani text-base font-bold text-slate-300 hover:text-white transition group cursor-pointer"
            >
              Already have an account?{' '}
              <span className="text-cyan-400 group-hover:underline font-bold ml-1">
                Sign In
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="h-2" />
    </div>
  );
};
