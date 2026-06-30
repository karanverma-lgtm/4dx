'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommitmentItem {
  id: string;
  text: string;
  completed: boolean;
}

interface WeeklyCommitment {
  week: number;
  items: CommitmentItem[];
}

interface CommitmentPanelProps {
  commitments: WeeklyCommitment[];
  onToggleCommitment: (weekNum: number, itemId: string) => void;
  onAddCommitment: (weekNum: number, text: string) => void;
  onDeleteCommitment?: (weekNum: number, itemId: string) => void;
  userRole?: 'admin' | 'user';
}

export default function CommitmentPanel({
  commitments = [],
  onToggleCommitment,
  onAddCommitment,
  onDeleteCommitment,
  userRole = 'user'
}: CommitmentPanelProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(6); // Default to Week 6 (current active week)
  const [newCommitmentText, setNewCommitmentText] = useState('');

  // Find commitments for the currently selected week
  const currentWeekData = commitments.find((c) => c.week === selectedWeek) || {
    week: selectedWeek,
    items: []
  };

  // Calculate stats for the current week
  const totalItems = currentWeekData.items.length;
  const completedItems = currentWeekData.items.filter((i) => i.completed).length;
  const completionScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitmentText.trim()) return;
    onAddCommitment(selectedWeek, newCommitmentText.trim());
    setNewCommitmentText('');
  };

  return (
    <div className="bg-surface-container-lowest/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col gap-6 relative group overflow-hidden">
      {/* Background Hover Accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4 relative z-10">
        <div>
          <h3 className="font-headline-md text-[18px] font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-primary">assignment_turned_in</span>
            Lead Measure Weekly Commitments
          </h3>
          <p className="text-xs text-on-surface-variant font-body-sm mt-0.5">
            Discipline 4: Report last week's commitments and make new ones.
          </p>
        </div>

        {/* Week Selector Chips */}
        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full md:max-w-xs scrollbar-none">
          {commitments.map((c) => {
            const isActive = selectedWeek === c.week;
            const weekScore = c.items.length > 0 
              ? Math.round((c.items.filter(i => i.completed).length / c.items.length) * 100)
              : 0;

            return (
              <button
                key={c.week}
                onClick={() => setSelectedWeek(c.week)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center flex-shrink-0 min-w-10 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm scale-[1.02]'
                    : 'bg-surface-container-low/50 border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span>W{c.week}</span>
                <span className={`text-[8px] opacity-75 mt-0.5 ${isActive ? 'text-on-primary' : weekScore === 100 ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {weekScore}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Score Progress Bar */}
      <div className="bg-surface-container-low/40 border border-outline-variant/15 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">
              Week {selectedWeek} Scoreboard
            </span>
            <span className={`text-sm font-bold font-label-md ${completionScore >= 70 ? 'text-secondary' : 'text-primary'}`}>
              {completionScore}% Kept ({completedItems}/{totalItems})
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden relative shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionScore}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
              className={`absolute top-0 left-0 h-full rounded-full ${
                completionScore >= 70 
                  ? 'bg-gradient-to-r from-secondary-fixed-dim to-secondary' 
                  : 'bg-gradient-to-r from-primary-fixed-dim to-primary'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Commitments Checklist */}
      <div className="space-y-2 relative z-10">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">
          Commitments List
        </span>
        {currentWeekData.items.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant text-body-sm">
            No commitments registered for Week {selectedWeek}.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {currentWeekData.items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${
                    item.completed
                      ? 'bg-secondary/5 border-secondary/20 hover:bg-secondary/8'
                      : 'bg-surface-container-low/20 border-outline-variant/20 hover:bg-surface-container-low/50'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer flex-1 select-none">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={userRole === 'admin' && selectedWeek !== 6} // Read-only for old admin weeks
                      onChange={() => onToggleCommitment(selectedWeek, item.id)}
                      className="mt-1 h-4 w-4 rounded border-outline-variant/50 text-secondary focus:ring-secondary/20 cursor-pointer accent-secondary"
                    />
                    <span className={`text-body-md font-medium transition-colors ${
                      item.completed ? 'text-on-surface-variant/70 line-through' : 'text-on-surface'
                    }`}>
                      {item.text}
                    </span>
                  </label>
                  
                  {onDeleteCommitment && (userRole !== 'admin' || selectedWeek === 6) && (
                    <button
                      onClick={() => onDeleteCommitment(selectedWeek, item.id)}
                      className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors ml-2"
                      title="Remove Commitment"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Commitment Form (Active week only) */}
      {(userRole !== 'admin' || selectedWeek === 6) && (
        <form onSubmit={handleAddSubmit} className="flex gap-2 relative z-10 mt-2">
          <input
            type="text"
            value={newCommitmentText}
            onChange={(e) => setNewCommitmentText(e.target.value)}
            placeholder="Commit to a weekly lead measure action..."
            maxLength={80}
            className="flex-1 bg-surface-container-low/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-colors text-body-sm shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add
          </motion.button>
        </form>
      )}
    </div>
  );
}
