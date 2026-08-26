import React, { useState } from 'react';
import { User, Key, Check } from 'lucide-react';
import { EsportsLogo } from './EsportsLogo';

interface LoginScreenProps {
  onLogin: (username: string) => void;
  onNavigateToSignUp: () => void;
  onForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onNavigateToSignUp,
  onForgotPassword,
}) => {
  const [identifier, setIdentifier] = useState('mdmobarok15');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your username or email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    onLogin(identifier);
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#1c1248] via-[#120a32] to-[#0a051d] text-white flex flex-col items-center justify-between p-6 py-8 relative overflow-y-auto">
      {/* Top Background Glow */}
      <div className="absolute top-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with Esports Club Logo & Title */}
      <div className="flex flex-col items-center text-center mt-2 z-10 w-full">
        {/* Esports Club Badge */}
        <EsportsLogo size="lg" className="mb-4" />

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-widest uppercase font-orbitron text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
          LOGIN
        </h1>

        {/* Subtitle in stylized cursive font matching Screenshot 1 */}
        <p className="font-cursive text-lg sm:text-xl text-indigo-200/90 mt-2 tracking-wide font-normal">
          Welcome Back sign in to your account
        </p>
      </div>

      {/* Main Login Form Card matching Screenshot 1 */}
      <div className="w-full max-w-md bg-[#1d1b2a]/90 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 sm:p-8 mt-6 shadow-2xl z-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* Username or Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              id="login-identifier-input"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username or Email"
              className="w-full pl-12 pr-4 py-3.5 bg-[#363544] hover:bg-[#3d3c4e] focus:bg-[#403f52] border border-slate-600/40 rounded-2xl text-white placeholder-slate-400 font-cursive text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-400/80 transition shadow-inner"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Key className="w-5 h-5" />
            </div>
            <input
              id="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3.5 bg-[#363544] hover:bg-[#3d3c4e] focus:bg-[#403f52] border border-slate-600/40 rounded-2xl text-white placeholder-slate-400 font-cursive text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-400/80 transition shadow-inner"
            />
          </div>

          {/* Remember Me & Forgot Password row */}
          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                  rememberMe
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-[#363544] border-slate-600 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-cursive text-base text-slate-200">Remember Me</span>
            </label>

            <button
              type="button"
              onClick={onForgotPassword}
              className="font-cursive text-base text-cyan-400 hover:text-cyan-300 transition hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button with Blue to Cyan Gradient */}
          <button
            id="login-submit-button"
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6d28d9] via-[#2563eb] to-[#06b6d4] hover:from-[#7c3aed] hover:via-[#3b82f6] hover:to-[#22d3ee] text-white font-extrabold font-orbitron tracking-widest text-lg shadow-[0_4px_20px_rgba(37,99,235,0.5)] transform active:scale-98 transition duration-200 cursor-pointer"
          >
            SIGN IN
          </button>

          {/* New User Footer */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="font-cursive text-lg text-slate-300 hover:text-white transition group cursor-pointer"
            >
              New User?{' '}
              <span className="text-cyan-400 group-hover:underline font-semibold ml-1">
                Register Now
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Fast Demo Credentials helper chip */}
      <div className="mt-4 z-10 text-center">
        <button
          onClick={() => {
            setIdentifier('mdmobarok15');
            setPassword('123456');
          }}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-slate-300 transition"
        >
          ⚡ Quick Demo Login: <span className="text-cyan-400 font-mono">mdmobarok15</span>
        </button>
      </div>
    </div>
  );
};
