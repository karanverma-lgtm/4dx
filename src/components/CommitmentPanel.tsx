'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommitmentItem {
  id: string;
  text: string;
  target: number;
  current: number;
  completed: boolean;
}

interface WeeklyCommitment {
  week: number;
  items: CommitmentItem[];
}

interface CommitmentPanelProps {
  commitments: WeeklyCommitment[];
  onUpdateCommitmentProgress: (weekNum: number, itemId: string, newCurrent: number) => void;
  onAddCommitment: (weekNum: number, text: string, target: number) => void;
  onDeleteCommitment?: (weekNum: number, itemId: string) => void;
  userRole?: 'admin' | 'user';
}

// Helper to calculate item progress percentage
function itemProgress(item: CommitmentItem): number {
  if (!item.target || item.target <= 0) return item.completed ? 100 : 0;
  return Math.min(Math.round((item.current / item.target) * 100), 100);
}

// Helper to calculate average progress for a week's items
function weekProgress(items: CommitmentItem[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, item) => acc + itemProgress(item), 0);
  return Math.round(sum / items.length);
}

export default function CommitmentPanel({
  commitments = [],
  onUpdateCommitmentProgress,
  onAddCommitment,
  onDeleteCommitment,
  userRole = 'user'
}: CommitmentPanelProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(6);
  const [newCommitmentText, setNewCommitmentText] = useState('');
  const [newCommitmentTarget, setNewCommitmentTarget] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Find commitments for the currently selected week
  const currentWeekData = commitments.find((c) => c.week === selectedWeek) || {
    week: selectedWeek,
    items: []
  };

  // Calculate stats for the current week using progress-based scoring
  const totalItems = currentWeekData.items.length;
  const completionScore = weekProgress(currentWeekData.items);
  const completedItems = currentWeekData.items.filter((i) => itemProgress(i) >= 100).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitmentText.trim()) return;
    const targetNum = parseInt(newCommitmentTarget) || 1;
    if (targetNum <= 0) return;
    onAddCommitment(selectedWeek, newCommitmentText.trim(), targetNum);
    setNewCommitmentText('');
    setNewCommitmentTarget('');
  };

  const handleProgressSave = (itemId: string) => {
    const num = parseInt(editValue);
    if (!isNaN(num) && num >= 0) {
      onUpdateCommitmentProgress(selectedWeek, itemId, num);
    }
    setEditingItemId(null);
    setEditValue('');
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
            Discipline 4: Track progress on each commitment with measurable targets.
          </p>
        </div>

        {/* Week Selector Chips */}
        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full md:max-w-xs scrollbar-none">
          {[1, 2, 3, 4, 5, 6].map((weekNum) => {
            const isActive = selectedWeek === weekNum;
            const weekData = commitments.find((c) => c.week === weekNum);
            const weekScore = weekData ? weekProgress(weekData.items) : 0;

            return (
              <button
                key={weekNum}
                onClick={() => setSelectedWeek(weekNum)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center flex-shrink-0 min-w-10 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm scale-[1.02]'
                    : 'bg-surface-container-low/50 border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span>W{weekNum}</span>
                <span className={`text-[8px] opacity-75 mt-0.5 ${isActive ? 'text-on-primary' : weekScore >= 100 ? 'text-secondary' : 'text-on-surface-variant'}`}>
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
              {completionScore}% Avg Progress ({completedItems}/{totalItems} completed)
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

      {/* Commitments List */}
      <div className="space-y-2 relative z-10">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">
          Commitments List
        </span>
        {currentWeekData.items.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant text-body-sm">
            No commitments registered for Week {selectedWeek}.
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {currentWeekData.items.map((item) => {
                const progress = itemProgress(item);
                const isComplete = progress >= 100;
                const isEditing = editingItemId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 border rounded-xl transition-all ${
                      isComplete
                        ? 'bg-secondary/5 border-secondary/20'
                        : 'bg-surface-container-low/20 border-outline-variant/20'
                    }`}
                  >
                    {/* Row 1: Title + Actions */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                          isComplete ? 'text-secondary' : progress > 0 ? 'text-primary' : 'text-on-surface-variant/50'
                        }`}>
                          {isComplete ? 'check_circle' : progress > 0 ? 'timelapse' : 'radio_button_unchecked'}
                        </span>
                        <div className="flex-1">
                          <span className={`text-body-md font-semibold transition-colors block ${
                            isComplete ? 'text-on-surface-variant/70 line-through' : 'text-on-surface'
                          }`}>
                            {item.text}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Progress Badge */}
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          isComplete
                            ? 'bg-secondary-container/60 text-on-secondary-container'
                            : progress > 50
                            ? 'bg-primary-fixed/40 text-on-primary-fixed'
                            : 'bg-surface-container-high/60 text-on-surface-variant'
                        }`}>
                          {item.current}/{item.target}
                        </span>

                        {onDeleteCommitment && (userRole !== 'admin' || selectedWeek === 6) && (
                          <button
                            onClick={() => onDeleteCommitment(selectedWeek, item.id)}
                            className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors"
                            title="Remove Commitment"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Progress Bar */}
                    <div className="mb-2.5">
                      <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden relative shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                          className={`absolute top-0 left-0 h-full rounded-full ${
                            isComplete
                              ? 'bg-gradient-to-r from-secondary-fixed-dim to-secondary'
                              : progress > 50
                              ? 'bg-gradient-to-r from-primary-fixed-dim to-primary'
                              : 'bg-gradient-to-r from-outline-variant to-primary-fixed-dim'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-[10px] font-semibold ${
                          isComplete ? 'text-secondary' : 'text-on-surface-variant/70'
                        }`}>
                          {progress}% {isComplete ? '✓ Completed' : 'progress'}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Update Progress Controls */}
                    {(userRole !== 'admin' || selectedWeek === 6) && !isComplete && (
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              min={0}
                              max={item.target}
                              placeholder={`${item.current}`}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleProgressSave(item.id);
                                if (e.key === 'Escape') { setEditingItemId(null); setEditValue(''); }
                              }}
                              className="w-20 bg-surface-container-low/80 border border-outline-variant/40 rounded-lg px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            <span className="text-[10px] text-on-surface-variant/70">/ {item.target}</span>
                            <button
                              onClick={() => handleProgressSave(item.id)}
                              className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-[11px] font-bold hover:bg-primary/90 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingItemId(null); setEditValue(''); }}
                              className="px-2 py-1.5 text-on-surface-variant hover:text-on-surface text-[11px] font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingItemId(item.id); setEditValue(item.current.toString()); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low/60 border border-outline-variant/30 rounded-lg text-[11px] font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            Update Progress
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Commitment Form */}
      {(userRole !== 'admin' || selectedWeek === 6) && (
        <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-2 relative z-10 mt-2">
          <input
            type="text"
            value={newCommitmentText}
            onChange={(e) => setNewCommitmentText(e.target.value)}
            placeholder="e.g. Call 100 clients this week..."
            maxLength={80}
            className="flex-1 bg-surface-container-low/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface"
          />
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-surface-container-low/60 border border-outline-variant/40 rounded-xl px-3 py-2.5">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">flag</span>
              <input
                type="number"
                value={newCommitmentTarget}
                onChange={(e) => setNewCommitmentTarget(e.target.value)}
                placeholder="Target"
                min={1}
                className="w-16 bg-transparent text-body-sm focus:outline-none text-on-surface placeholder:text-on-surface-variant/50"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-colors text-body-sm shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
}
