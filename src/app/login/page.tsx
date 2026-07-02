'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { USER_CREDENTIALS } from '../../data/mockData';
import dynamic from 'next/dynamic';

const Loader = dynamic(() => import('../../components/Loader'), {
  ssr: false,
});

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const isAuth = localStorage.getItem('isLoggedIn') === 'true';
    if (isAuth) {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const match = USER_CREDENTIALS.find(
        (cred) =>
          cred.username.toLowerCase() === username.trim().toLowerCase() &&
          cred.password === password
      );

      if (match) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUser', match.username);
        localStorage.setItem('userRole', match.role);
        localStorage.setItem('userId', match.userId);
        router.replace('/');
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex font-body-md text-on-background bg-surface-bright">
      {loading && <Loader fullScreen={true} text="Verifying credentials..." />}
      {/* Column 1: Image Panel (Visible on Desktop/Tablet) */}
      <div className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden select-none">
        {/* Background Image */}
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-65"
          alt="Corporate boardroom analytics presentation showing growth insights and charts"
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200"
        />
        {/* Color overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent"></div>

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full text-on-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[24px]">query_stats</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold tracking-tight">
              4DX Portal
            </span>
          </div>

          <div className="space-y-4 max-w-lg">
            <span className="text-xs font-semibold text-secondary-fixed bg-secondary-fixed/10 px-3 py-1.5 rounded-full inline-block border border-secondary-fixed/20 tracking-wider font-label-md uppercase">
              Precision Performance
            </span>
            <h2 className="font-display-lg text-[40px] font-bold leading-tight tracking-tight text-white">
              Data-first metrics for executive leaders.
            </h2>
            <p className="text-on-primary-container text-body-md leading-relaxed opacity-90">
              Align targets, track lead actions, and execute wildy important goals (WIGs) with absolute precision and real-time analytical clarity.
            </p>
          </div>

          <div className="text-xs text-on-primary-container/60 font-label-sm">
            © 2026 4DX Performance Inc. All rights reserved.
          </div>
        </div>
      </div>

      {/* Column 2: Login Form Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-surface-bright bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-container-low/40 via-surface-bright to-surface-bright">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative"
        >
          {/* Accent indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-b-full"></div>

          {/* Form Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-4 shadow-md ring-1 ring-primary/25 md:hidden">
              <span className="material-symbols-outlined text-[28px]">lock</span>
            </div>
            <h1 className="font-headline-md text-[26px] font-bold text-on-surface tracking-tight mb-1">
              Sign In
            </h1>
            <p className="text-on-surface-variant text-body-sm">
              Please enter your dashboard credentials to proceed.
            </p>
          </div>

          {/* Error Message Box */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-error-container/80 border border-error-container/30 text-on-error-container text-body-sm font-semibold rounded-lg p-3 mb-5 flex items-center gap-2 overflow-hidden"
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inputs Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 px-0.5">
                Username
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-3 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface disabled:opacity-50 transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 px-0.5">
                Password
              </label>
              <input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-3 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface disabled:opacity-50 transition-all"
                placeholder="Enter your password"
              />
            </div>

            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-primary/95 transition-all text-body-md shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
