'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserPerformance } from '../data/mockData';

interface TeamScoreboardProps {
  users: UserPerformance[];
  selectedQuarter: 'q1' | 'q2' | 'q3' | 'q4';
  onDrillDown: (userId: string) => void;
}

type SortField = 'commitmentAverage' | 'revenue' | 'pipeline' | 'seats';
type SortOrder = 'asc' | 'desc';

export default function TeamScoreboard({
  users = [],
  selectedQuarter,
  onDrillDown
}: TeamScoreboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState<'All' | 'Open Program'>('All');
  const [sortField, setSortField] = useState<SortField>('commitmentAverage');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Format utility for Indian Rupee Lakhs/Crores
  const formatIndianCurrency = (value: number) => {
    if (value >= 10000000) {
      return '₹' + (value / 10000000).toFixed(2) + ' Cr';
    }
    if (value >= 100000) {
      return '₹' + (value / 100000).toFixed(1) + ' L';
    }
    return '₹' + value.toLocaleString('en-IN');
  };

  // Helper to extract metrics for a user based on quarter
  const getUserQuarterlyData = (user: any) => {
    const qData = user.quarterlyMetrics ? user.quarterlyMetrics[selectedQuarter] : user.metrics;
    
    // Calculate commitment average based on checklist items if available
    let commitmentAverage = user.commitmentAverage;
    const commitmentsList = qData ? qData.commitments || [] : [];
    if (commitmentsList.length > 0) {
      const weeklyScores = commitmentsList.map((c: any) => {
        const total = c.items.length;
        const completed = c.items.filter((i: any) => i.completed).length;
        return total > 0 ? (completed / total) * 100 : 0;
      });
      const sum = weeklyScores.reduce((acc: number, val: number) => acc + val, 0);
      commitmentAverage = Math.round(sum / commitmentsList.length);
    }
    
    return {
      ...user,
      commitmentAverage,
      metrics: qData
    };
  };

  // Map users with their selected quarter's data
  const mappedUsers = useMemo(() => {
    return users.map(getUserQuarterlyData);
  }, [users, selectedQuarter]);

  // Aggregated Team KPIs
  const teamAggregates = useMemo(() => {
    let revCurrent = 0, revTarget = 0;
    let pipeCurrent = 0, pipeTarget = 0;
    let seatsCurrent = 0, seatsTarget = 0;

    mappedUsers.forEach((u) => {
      revCurrent += u.metrics.revenue.current;
      revTarget += u.metrics.revenue.target;
      pipeCurrent += u.metrics.pipeline.current;
      pipeTarget += u.metrics.pipeline.target;
      seatsCurrent += u.metrics.seats.current;
      seatsTarget += u.metrics.seats.target;
    });

    return {
      revenue: {
        current: revCurrent,
        target: revTarget,
        progress: revTarget > 0 ? Math.round((revCurrent / revTarget) * 100) : 0
      },
      pipeline: {
        current: pipeCurrent,
        target: pipeTarget,
        progress: pipeTarget > 0 ? Math.round((pipeCurrent / pipeTarget) * 100) : 0
      },
      seats: {
        current: seatsCurrent,
        target: seatsTarget,
        progress: seatsTarget > 0 ? Math.round((seatsCurrent / seatsTarget) * 100) : 0
      }
    };
  }, [mappedUsers]);

  // Handle Sorting Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    let result = mappedUsers.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam = teamFilter === 'All' || u.team === teamFilter;
      return matchesSearch && matchesTeam;
    });

    // Sort
    result.sort((a, b) => {
      let valA: number;
      let valB: number;

      if (sortField === 'commitmentAverage') {
        valA = a.commitmentAverage;
        valB = b.commitmentAverage;
      } else {
        valA = a.metrics[sortField].progress;
        valB = b.metrics[sortField].progress;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [mappedUsers, searchTerm, teamFilter, sortField, sortOrder]);

  return (
    <div className="space-y-8">
      {/* Aggregated KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Team Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block font-label-sm">Team Revenue WIG</span>
              <span className="text-[20px] font-bold text-on-surface tracking-tight font-display-lg leading-tight mt-0.5">
                {formatIndianCurrency(teamAggregates.revenue.current)}
              </span>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex justify-between items-center text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 font-label-sm">
              <span>Goal Progress ({teamAggregates.revenue.progress}%)</span>
              <span>Target: {formatIndianCurrency(teamAggregates.revenue.target)}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-secondary-fixed-dim to-secondary rounded-full" 
                style={{ width: `${teamAggregates.revenue.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pipeline Team Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-error/10 text-error">
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block font-label-sm">Team Pipeline WIG</span>
              <span className="text-[20px] font-bold text-on-surface tracking-tight font-display-lg leading-tight mt-0.5">
                {formatIndianCurrency(teamAggregates.pipeline.current)}
              </span>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex justify-between items-center text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 font-label-sm">
              <span>Goal Progress ({teamAggregates.pipeline.progress}%)</span>
              <span>Target: {formatIndianCurrency(teamAggregates.pipeline.target)}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-error-container to-error rounded-full" 
                style={{ width: `${teamAggregates.pipeline.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Seats Team Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">event_seat</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block font-label-sm">Team Seats Booked</span>
              <span className="text-[20px] font-bold text-on-surface tracking-tight font-display-lg leading-tight mt-0.5">
                {teamAggregates.seats.current} seats
              </span>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex justify-between items-center text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 font-label-sm">
              <span>Goal Progress ({teamAggregates.seats.progress}%)</span>
              <span>Target: {teamAggregates.seats.target}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-fixed-dim to-primary rounded-full" 
                style={{ width: `${teamAggregates.seats.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Panel */}
      <div className="bg-surface-container-lowest/80 border border-outline-variant/30 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col gap-6 relative">
        
        {/* Table Filters Header */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-surface-container-low border border-outline-variant/20 rounded-xl p-1 shadow-sm gap-1 w-full md:w-auto">
            {(['All', 'Open Program'] as const).map((team) => {
              const isActive = teamFilter === team;
              return (
                <button
                  key={team}
                  onClick={() => setTeamFilter(team)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm scale-[1.02]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {team}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Search team member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl pl-9 pr-4 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            />
          </div>
        </div>

        {/* Leaderboard Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-body-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 pb-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-md">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Team</th>
                <th 
                  onClick={() => handleSort('commitmentAverage')}
                  className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center gap-1">
                    Commitment Score
                    {sortField === 'commitmentAverage' && (
                      <span className="material-symbols-outlined text-[12px]">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                    )}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('revenue')}
                  className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center gap-1">
                    Revenue Progress
                    {sortField === 'revenue' && (
                      <span className="material-symbols-outlined text-[12px]">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                    )}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('pipeline')}
                  className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center gap-1">
                    Pipeline Progress
                    {sortField === 'pipeline' && (
                      <span className="material-symbols-outlined text-[12px]">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                    )}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('seats')}
                  className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center gap-1">
                    Seats Progress
                    {sortField === 'seats' && (
                      <span className="material-symbols-outlined text-[12px]">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                    )}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {processedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant font-semibold">
                    No team members found matching filters.
                  </td>
                </tr>
              ) : (
                processedUsers.map((user, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr
                      key={user.id}
                      onClick={() => onDrillDown(user.id)}
                      className="border-b border-outline-variant/10 hover:bg-surface-container-low/30 cursor-pointer transition-colors duration-150 group/row"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 font-bold text-on-surface-variant/80 font-label-md">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </td>
                      {/* Employee Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatarUrl} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full object-cover border border-outline-variant/30"
                          />
                          <div>
                            <div className="font-bold text-on-surface group-hover/row:text-primary transition-colors">
                              {user.name}
                            </div>
                            <div className="text-[10px] text-on-surface-variant/80 mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Team */}
                      <td className="py-4 px-4 font-semibold text-on-surface-variant">
                        {user.team}
                      </td>
                      {/* Commitment score */}
                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                          user.commitmentAverage >= 70 
                            ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                            : 'bg-primary/5 text-primary border border-primary/20'
                        }`}>
                          {user.commitmentAverage}%
                        </span>
                      </td>
                      {/* Revenue progress bar */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 w-28">
                          <div className="flex justify-between items-center text-[9px] font-semibold text-on-surface-variant font-label-sm">
                            <span>{formatIndianCurrency(user.metrics.revenue.current)}</span>
                            <span>{user.metrics.revenue.progress}%</span>
                          </div>
                          <div className="h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
                            <div className="h-full bg-secondary" style={{ width: `${user.metrics.revenue.progress}%` }} />
                          </div>
                        </div>
                      </td>
                      {/* Pipeline progress bar */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 w-28">
                          <div className="flex justify-between items-center text-[9px] font-semibold text-on-surface-variant font-label-sm">
                            <span>{formatIndianCurrency(user.metrics.pipeline.current)}</span>
                            <span>{user.metrics.pipeline.progress}%</span>
                          </div>
                          <div className="h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
                            <div className="h-full bg-error" style={{ width: `${user.metrics.pipeline.progress}%` }} />
                          </div>
                        </div>
                      </td>
                      {/* Seats progress bar */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 w-24">
                          <div className="flex justify-between items-center text-[9px] font-semibold text-on-surface-variant font-label-sm">
                            <span>{user.metrics.seats.current} seats</span>
                            <span>{user.metrics.seats.progress}%</span>
                          </div>
                          <div className="h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${user.metrics.seats.progress}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
