'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPerformance } from '../data/mockData';

interface LeaderboardProps {
  users: UserPerformance[];
  allAnalytics: Record<string, { total_calls: number; answered_calls: number; total_minutes: number }> | null;
}

type MetricType = 'total_calls' | 'answered_calls' | 'total_minutes';

export default function Leaderboard({ users, allAnalytics }: LeaderboardProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('total_calls');

  // Fallback default analytics if empty
  const defaultAnalytics = {
    total_calls: 0,
    answered_calls: 0,
    total_minutes: 0
  };

  // Compile leaderboard list
  const leaderboardData = users.map((user) => {
    const analytics = allAnalytics?.[user.email.toLowerCase()] || defaultAnalytics;
    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      team: user.team,
      value: activeMetric === 'total_minutes' 
        ? Math.round(analytics.total_minutes) 
        : analytics[activeMetric]
    };
  });

  // Sort descending by value
  const sortedData = [...leaderboardData].sort((a, b) => b.value - a.value);

  // Divide into podium (Top 3) vs rest
  const podium = sortedData.slice(0, 3);
  const rest = sortedData.slice(3);

  // Re-arrange podium to [2nd, 1st, 3rd] for visual presentation
  const visualPodium = [];
  if (podium[1]) visualPodium.push({ ...podium[1], rank: 2 });
  if (podium[0]) visualPodium.push({ ...podium[0], rank: 1 });
  if (podium[2]) visualPodium.push({ ...podium[2], rank: 3 });

  const getMetricLabel = (val: number) => {
    if (activeMetric === 'total_minutes') return `${val} mins`;
    if (activeMetric === 'answered_calls') return `${val} answered`;
    return `${val} dials`;
  };

  return (
    <div className="w-full flex flex-col gap-6 font-body-md text-on-surface">
      {/* Tab Selectors for Metric */}
      <div className="flex bg-surface-container-low border border-outline-variant/15 rounded-2xl p-1.5 shadow-sm gap-1 w-full max-w-md mx-auto relative z-10">
        {[
          { key: 'total_calls' as const, label: 'Dials', icon: 'call' },
          { key: 'answered_calls' as const, label: 'Answered', icon: 'call_missed_outgoing' },
          { key: 'total_minutes' as const, label: 'Duration', icon: 'schedule' }
        ].map((metric) => (
          <button
            key={metric.key}
            onClick={() => setActiveMetric(metric.key)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMetric === metric.key
                ? 'bg-primary text-on-primary shadow-md scale-[1.02]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/30'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{metric.icon}</span>
            {metric.label}
          </button>
        ))}
      </div>

      {/* Podium View (Top 3) */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 items-end justify-center w-full max-w-2xl mx-auto pt-6 px-2 min-h-[220px]">
        {visualPodium.map((user) => {
          const isFirst = user.rank === 1;
          const isSecond = user.rank === 2;
          const isThird = user.rank === 3;

          const heightClass = isFirst 
            ? 'h-40 md:h-48 bg-gradient-to-t from-primary/10 to-primary/5 border-primary/20' 
            : isSecond 
            ? 'h-32 md:h-36 bg-gradient-to-t from-secondary/10 to-secondary/5 border-secondary/20' 
            : 'h-24 md:h-28 bg-gradient-to-t from-tertiary-fixed-dim/20 to-tertiary-fixed-dim/5 border-outline-variant/20';

          const crownColor = isFirst 
            ? 'text-yellow-500' 
            : isSecond 
            ? 'text-slate-400' 
            : 'text-amber-700';

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: user.rank * 0.1 }}
              className="flex flex-col items-center text-center relative"
            >
              {/* Crown / Rank Icon */}
              <div className="relative mb-2 flex flex-col items-center">
                {isFirst && (
                  <motion.span 
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="material-symbols-outlined text-[24px] text-yellow-500 absolute -top-5"
                  >
                    crown
                  </motion.span>
                )}
                <img
                  className={`rounded-full object-cover shadow-lg border-2 ${
                    isFirst ? 'w-16 h-16 md:w-20 md:h-20 border-yellow-400' : 'w-12 h-12 md:w-16 md:h-16 border-outline-variant'
                  }`}
                  src={user.avatarUrl}
                  alt={user.name}
                />
                <span className={`absolute -bottom-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md ${
                  isFirst ? 'bg-yellow-500' : isSecond ? 'bg-slate-400' : 'bg-amber-700'
                }`}>
                  {user.rank}
                </span>
              </div>

              {/* Pedestal Card */}
              <div className={`w-full rounded-t-2xl border border-b-0 flex flex-col justify-end p-3 gap-1 shadow-md ${heightClass}`}>
                <h4 className="font-bold text-xs md:text-sm text-on-surface truncate px-1">{user.name}</h4>
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider truncate mb-1">{user.team}</p>
                <div className="bg-surface-container-lowest/80 border border-outline-variant/25 py-1.5 px-2 rounded-xl shadow-inner mt-auto">
                  <span className={`text-[10px] md:text-xs font-bold ${
                    isFirst ? 'text-yellow-600' : isSecond ? 'text-secondary' : 'text-on-surface-variant'
                  }`}>
                    {getMetricLabel(user.value)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rankings List (for any remaining positions beyond Top 3) */}
      <AnimatePresence mode="wait">
        {rest.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto flex flex-col gap-2 mt-4"
          >
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1 mb-1">
              Full Rankings
            </span>
            {rest.map((user, index) => {
              const rank = index + 4;
              return (
                <motion.div
                  key={user.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3.5 border border-outline-variant/15 bg-surface-container-low/20 hover:bg-surface-container-low/50 rounded-xl transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-on-surface-variant w-4 text-center">{rank}</span>
                    <img
                      className="w-8 h-8 rounded-full object-cover border border-outline-variant/35"
                      src={user.avatarUrl}
                      alt={user.name}
                    />
                    <div>
                      <h4 className="text-body-md font-bold text-on-surface leading-tight">{user.name}</h4>
                      <p className="text-[9px] text-on-surface-variant/80 font-bold uppercase tracking-wider mt-0.5">{user.team}</p>
                    </div>
                  </div>
                  <span className="text-body-sm font-bold text-primary">
                    {getMetricLabel(user.value)}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
