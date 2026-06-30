'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPerformance } from '../data/mockData';

interface HeaderProps {
  activeUser: UserPerformance;
  onOpenExport: () => void;
  userRole?: 'admin' | 'user';
  viewMode?: 'individual' | 'overview';
  onChangeViewMode?: (mode: 'individual' | 'overview') => void;
}

export default function Header({
  activeUser,
  onOpenExport,
  userRole = 'user',
  viewMode = 'individual',
  onChangeViewMode,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center w-full px-8 py-4 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 z-10 flex-shrink-0 relative font-body-md">
      {/* Left side: branding/title */}
      <div className="flex items-center gap-6">
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
          Sales WIG Dashboard
        </h1>

        {/* View Mode Segment Controls (Admin only) - now placed in Header */}
        {userRole === 'admin' && onChangeViewMode && (
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-1 shadow-inner flex w-56 relative z-10">
            <button
              onClick={() => onChangeViewMode('overview')}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'overview'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">grid_view</span>
              Scoreboard
            </button>
            <button
              onClick={() => onChangeViewMode('individual')}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'individual'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">person</span>
              Profile
            </button>
          </div>
        )}
      </div>

      {/* Right side: settings, help, notifications, and export */}
      <div className="flex items-center space-x-6">
        {/* Notifications and Help */}
        <div className="flex items-center space-x-2 text-on-surface-variant">
          <button className="hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container-low relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-error border border-surface-container-lowest"></span>
          </button>
          <button className="hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>
        </div>
        
        <div className="w-px h-5 bg-outline-variant/50"></div>

        {/* Dynamic Export Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenExport}
          className="border border-outline-variant/60 text-on-surface font-body-md font-medium px-4 py-2 rounded-lg hover:bg-surface-container-low hover:border-primary transition-all shadow-sm flex items-center gap-1.5 text-xs uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export
        </motion.button>

        {/* User Card */}
        <div className="flex items-center gap-2">
          <img
            className="w-8 h-8 rounded-full object-cover border border-outline-variant/30 shadow-sm"
            alt={activeUser.name}
            src={activeUser.avatarUrl}
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-on-surface leading-none">{activeUser.name}</span>
            <span className="text-[9px] text-on-surface-variant/80 uppercase tracking-widest font-bold mt-0.5">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
