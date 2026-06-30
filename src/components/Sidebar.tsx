'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { UserPerformance, mockUsers } from '../data/mockData';

interface SidebarProps {
  activeUser: UserPerformance;
  onSelectUser: (user: UserPerformance) => void;
  activeTeam: 'Executive Board' | 'Open Program';
  onSelectTeam: (team: 'Executive Board' | 'Open Program') => void;
  sessionActive: boolean;
  onToggleSession: () => void;
  sessionTime: string;
  onOpenSettings: () => void;
  onLogout: () => void;
  userRole?: 'admin' | 'user';
}

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.8, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function Sidebar({
  activeUser,
  onSelectUser,
  activeTeam,
  onSelectTeam,
  sessionActive,
  onToggleSession,
  sessionTime,
  onOpenSettings,
  onLogout,
  userRole = 'admin',
}: SidebarProps) {
  // Filter users based on selected team, or list all but highlight team-specific styling
  const teams: ('Executive Board' | 'Open Program')[] = ['Executive Board', 'Open Program'];

  return (
    <aside className="w-64 bg-surface-container-lowest flex flex-col h-screen border-r border-outline-variant/50 flex-shrink-0 z-20 shadow-sm font-body-md">
      <div className="p-6 space-y-8 flex-1 overflow-y-auto">
        {/* CTA - Start Session */}
        <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 text-center shadow-sm relative overflow-hidden group">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onToggleSession}
            className={`w-full font-headline-md text-headline-md py-2.5 rounded-lg transition-colors shadow-md text-on-primary ${
              sessionActive 
                ? 'bg-error hover:bg-error/90' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {sessionActive ? 'End WIG Session' : 'Start WIG Session'}
          </motion.button>
          
          <div className="mt-3 text-on-surface-variant font-body-sm text-body-sm flex items-center justify-center gap-1.5">
            {sessionActive ? (
              <span className="flex items-center text-secondary font-semibold">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                Meeting Active: <span className="font-mono ml-1">{sessionTime}</span>
              </span>
            ) : (
              <span className="flex items-center text-error font-semibold">
                <span className="w-2 h-2 rounded-full bg-error mr-1.5"></span>
                WIG Session is: stopped
              </span>
            )}
          </div>
        </div>


        {/* Profile Card */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-surface-container-highest mb-4 overflow-hidden border-2 border-surface shadow-md ring-1 ring-outline-variant/20 relative group">
            <img 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              alt={activeUser.name} 
              src={activeUser.avatarUrl}
            />
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold text-center">
            {activeUser.name}
          </h2>
          <div className="font-display-lg text-display-lg text-primary flex items-baseline mt-1 tracking-tight">
            <AnimatedNumber value={activeUser.commitmentAverage} />
            <span className="text-headline-lg font-headline-lg text-primary/80">%</span>
          </div>
          <div className="text-on-surface-variant font-body-sm text-body-sm mt-1">
            6 Week WIG Commitment Score
          </div>
        </div>

        <div className="w-full h-px bg-outline-variant/30"></div>

        {userRole === 'admin' ? (
          <>
            {/* Team Selection */}
            <div>
              <div className="text-on-surface-variant font-label-md text-label-md mb-2 px-2 tracking-wider">
                TEAM SELECTION
              </div>
              <ul className="space-y-1">
                {teams.map((team) => {
                  const isSelected = activeTeam === team;
                  return (
                    <li
                      key={team}
                      onClick={() => onSelectTeam(team)}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-body-md flex items-center ${
                        isSelected
                          ? 'text-primary font-semibold bg-surface-container-low shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                    >
                      <span 
                        className={`w-1.5 h-1.5 rounded-full mr-2 transition-colors duration-200 ${
                          isSelected ? 'bg-primary' : 'bg-outline-variant'
                        }`}
                      />
                      {team}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* User Selection */}
            <div>
              <div className="text-on-surface-variant font-label-md text-label-md mb-2 px-2 tracking-wider">
                USER SELECTION
              </div>
              <ul className="space-y-1">
                {mockUsers.map((user) => {
                  const isSelected = activeUser.id === user.id;
                  const isSameTeam = user.team === activeTeam;
                  return (
                    <li
                      key={user.id}
                      onClick={() => onSelectUser(user)}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-body-md flex items-center group ${
                        isSelected
                          ? 'text-primary font-semibold bg-surface-container-low shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      } ${!isSameTeam ? 'opacity-50 hover:opacity-80' : ''}`}
                    >
                      <span 
                        className={`w-1.5 h-1.5 rounded-full mr-2 transition-colors duration-200 ${
                          isSelected 
                            ? 'bg-primary' 
                            : 'bg-outline-variant group-hover:bg-primary'
                        }`}
                      />
                      {user.name}
                      {user.team === activeTeam && !isSelected && (
                        <span className="ml-auto w-1 h-1 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        ) : (
          <div className="bg-primary/5 border border-outline-variant/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="font-bold text-xs uppercase tracking-wider">Employee Portal</span>
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              Welcome back, <span className="font-semibold text-on-surface">{activeUser.name}</span>. You can manage and edit your target milestones directly from this portal.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-outline-variant/30 space-y-1 bg-surface-container-lowest">
        <button 
          onClick={onOpenSettings}
          className="flex items-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface w-full p-2.5 rounded-lg transition-colors group"
        >
          <span className="material-symbols-outlined mr-3 text-[20px] group-hover:text-primary transition-colors">
            settings
          </span>
          <span className="font-body-md text-body-md font-medium">Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface w-full p-2.5 rounded-lg transition-colors group"
        >
          <span className="material-symbols-outlined mr-3 text-[20px] group-hover:text-error transition-colors">
            logout
          </span>
          <span className="font-body-md text-body-md font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
