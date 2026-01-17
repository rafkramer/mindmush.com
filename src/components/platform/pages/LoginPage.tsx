import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Small delay for UX
    setTimeout(() => {
      const success = onLogin(username, password);
      if (!success) {
        setError(true);
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0b]">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 backdrop-blur-md">
          {/* Logo */}
          <div className="text-center mb-8">
            {/* Mindmush Logo */}
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                {/* Outer ring */}
                <svg viewBox="0 0 64 64" className="w-full h-full">
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  {/* Outer circle */}
                  <circle cx="32" cy="32" r="30" fill="none" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.3" />
                  {/* Inner wireframe sphere effect */}
                  <ellipse cx="32" cy="32" rx="22" ry="22" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.6" />
                  <ellipse cx="32" cy="32" rx="22" ry="10" fill="none" stroke="url(#logoGradient)" strokeWidth="1" opacity="0.4" />
                  <ellipse cx="32" cy="32" rx="10" ry="22" fill="none" stroke="url(#logoGradient)" strokeWidth="1" opacity="0.4" />
                  {/* Center dot */}
                  <circle cx="32" cy="32" r="4" fill="url(#logoGradient)" />
                </svg>
              </div>
            </div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-purple-400/60 uppercase">
              MINDMUSH
            </span>
            <h1 className="text-xl font-semibold text-white tracking-tight mt-2">
              Partner Platform
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Invalid username or password
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Sign In
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-white/30 text-xs">
              MINDMUSH LLC • Zurich, Switzerland
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
