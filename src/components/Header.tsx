'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPerformance } from '../data/mockData';

interface HeaderProps {
  activeUser: UserPerformance;
  onOpenExport: () => void;
  userRole?: 'admin' | 'user';
  viewMode?: 'individual' | 'overview' | 'leaderboard';
  onChangeViewMode?: (mode: 'individual' | 'overview' | 'leaderboard') => void;
}

interface NotificationItem {
  id: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
}

export default function Header({
  activeUser,
  onOpenExport,
  userRole = 'user',
  viewMode = 'individual',
  onChangeViewMode,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Seeded mock notifications related to 4DX scorecard and VoIP alerts
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      message: 'Weekly WIG commitments check-in is due by Friday 5:00 PM.',
      time: '2 hours ago',
      type: 'info',
      read: false,
    },
    {
      id: '2',
      message: 'Gitanjali has completed 100% of the Q1 seats booking WIG goal! 🥇',
      time: '1 day ago',
      type: 'success',
      read: false,
    },
    {
      id: '3',
      message: 'Calling Analytics Warning: 4 VoIP dials left in a disconnected state.',
      time: '2 days ago',
      type: 'warning',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <>
      <header className="flex justify-between items-center w-full px-8 py-4 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 z-30 flex-shrink-0 relative font-body-md">
        {/* Left side: branding/title */}
        <div className="flex items-center gap-6">
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            Sales WIG Dashboard
          </h1>

          {/* View Mode Segment Controls */}
          {onChangeViewMode && (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-1 shadow-inner flex w-80 relative z-10">
              <button
                onClick={() => onChangeViewMode('overview')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  viewMode === 'overview'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">grid_view</span>
                Scoreboard
              </button>
              <button
                onClick={() => onChangeViewMode('individual')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  viewMode === 'individual'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">person</span>
                Profile
              </button>
              <button
                onClick={() => onChangeViewMode('leaderboard')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  viewMode === 'leaderboard'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">stars</span>
                Leaderboard
              </button>
            </div>
          )}
        </div>

        {/* Right side: settings, help, notifications, and export */}
        <div className="flex items-center space-x-6 relative">
          {/* Notifications and Help Buttons */}
          <div className="flex items-center space-x-2 text-on-surface-variant">
            {/* Notification Bell Button */}
            <button
              onClick={handleToggleNotifications}
              className={`p-1.5 rounded-full hover:bg-surface-container-low relative cursor-pointer transition-colors ${
                showNotifications ? 'bg-surface-container-low text-primary' : 'hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error border border-surface-container-lowest animate-pulse"></span>
              )}
            </button>

            {/* Help/Question Mark Button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container-low cursor-pointer"
              title="Dashboard Help Guide"
            >
              <span className="material-symbols-outlined text-[20px]">help_outline</span>
            </button>
          </div>
          
          <div className="w-px h-5 bg-outline-variant/50"></div>

          {/* Dynamic Export Action */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenExport}
            className="border border-outline-variant/60 text-on-surface font-body-md font-medium px-4 py-2 rounded-lg hover:bg-surface-container-low hover:border-primary transition-all shadow-sm flex items-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
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

          {/* Floating Dropdown: Notifications List */}
          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Click outside backdrop overlay */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setShowNotifications(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 bg-surface-container-lowest/95 backdrop-blur-lg border border-outline-variant/30 rounded-2xl shadow-xl z-55 overflow-hidden flex flex-col p-4"
                >
                  {/* Dropdown Header */}
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3 mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                      Notifications ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Dropdown Scrollable List */}
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-0.5">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-on-surface-variant/80 font-semibold text-xs">
                        No notifications recorded.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-2.5 p-2.5 border border-outline-variant/10 rounded-xl transition-all relative ${
                            notif.read ? 'opacity-65' : 'bg-surface-container-low/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.01)]'
                          }`}
                        >
                          {/* Notification Type Indicator Badge */}
                          <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                            notif.type === 'success' 
                              ? 'bg-secondary/15 text-secondary' 
                              : notif.type === 'warning' 
                              ? 'bg-error/15 text-error' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">
                              {notif.type === 'success' 
                                ? 'check_circle' 
                                : notif.type === 'warning' 
                                ? 'warning' 
                                : 'info'}
                            </span>
                          </div>

                          {/* Message Body */}
                          <div className="flex-1 text-left">
                            <p className="text-xs text-on-surface font-medium leading-tight">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-on-surface-variant/60 font-body-sm block mt-1">
                              {notif.time}
                            </span>
                          </div>

                          {/* Unread circle dot indicator */}
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Floating Modal Overlay: 4DX Help and Information Guide */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-surface-container-lowest border border-outline-variant/35 rounded-3xl p-6 shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[85vh]"
            >
              {/* Modal Title Banner */}
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                    <span className="material-symbols-outlined text-[24px]">explore</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[18px] font-bold text-on-surface">4DX Execution Guide</h3>
                    <p className="text-[10px] text-on-surface-variant font-body-sm tracking-wider uppercase font-bold mt-0.5">The 4 Disciplines of Execution framework</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1.5 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="overflow-y-auto space-y-6 flex-1 pr-1 font-body-md text-on-surface text-xs leading-relaxed">
                
                {/* Introduction block */}
                <p className="text-on-surface-variant font-semibold text-xs border-l-2 border-primary pl-3 bg-surface-container-low/20 py-2 rounded-r-lg">
                  Welcome to the 4DX Sales execution tool! 4DX is a proven methodology for execution. It helps teams bypass the "whirlwind" of daily urgent tasks and execute on their wildly important goals.
                </p>

                {/* 4 Disciplines Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Discipline 1 Card */}
                  <div className="bg-surface-container-low/30 border border-outline-variant/10 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">Discipline 1: Focus on WIG</h4>
                    </div>
                    <p className="text-on-surface-variant font-body-sm text-[11px] leading-normal">
                      Focus on 1-2 <strong>Wildly Important Goals</strong> (WIGs) instead of dozens. On the scoreboard tab, you can track Q1 goals for Revenue, Pipeline, and Seats.
                    </p>
                  </div>

                  {/* Discipline 2 Card */}
                  <div className="bg-surface-container-low/30 border border-outline-variant/10 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">Discipline 2: Act on Lead Measures</h4>
                    </div>
                    <p className="text-on-surface-variant font-body-sm text-[11px] leading-normal">
                      Lag measures (Revenue) track history. Lead measures track tasks you control (making discovery calls, booking demos). Log weekly lead indicators inside the <strong>Weekly Commitments</strong> tab.
                    </p>
                  </div>

                  {/* Discipline 3 Card */}
                  <div className="bg-surface-container-low/30 border border-outline-variant/10 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📈</span>
                      <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">Discipline 3: Scoreboard</h4>
                    </div>
                    <p className="text-on-surface-variant font-body-sm text-[11px] leading-normal">
                      Keep a compelling scoreboard so everyone knows if they are winning or losing at a 5-second glance. Area charts visualize WIG metrics trends.
                    </p>
                  </div>

                  {/* Discipline 4 Card */}
                  <div className="bg-surface-container-low/30 border border-outline-variant/10 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🤝</span>
                      <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">Discipline 4: Cadence</h4>
                    </div>
                    <p className="text-on-surface-variant font-body-sm text-[11px] leading-normal">
                      Create a cadence of accountability. Start a **Weekly WIG Session** using the stopwatch in the sidebar to review past commitments and make new ones.
                    </p>
                  </div>
                </div>

                {/* Dashboard Usage Tips */}
                <div className="border-t border-outline-variant/15 pt-4">
                  <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-2">How to Navigate</h4>
                  <ul className="list-disc pl-5 space-y-1 text-on-surface-variant text-[11px] font-body-sm">
                    <li>Use the tabs in the individual view to toggle between visual charts (WIG Scoreboard) and task checklists (Weekly Commitments).</li>
                    <li>If you are an Administrator, click **Scoreboard** in the Header to see a team-wide performance leaderboard and drill down into profiles.</li>
                    <li>Click **Start WIG Session** in the sidebar to record meeting accountability sessions.</li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex justify-end border-t border-outline-variant/20 pt-4 mt-5">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
