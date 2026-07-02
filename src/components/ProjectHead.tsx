'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { UserPerformance } from '../data/mockData';

interface ProjectHeadProps {
  users: UserPerformance[];
  selectedQuarter: 'q1' | 'q2' | 'q3' | 'q4';
}

export default function ProjectHead({ users, selectedQuarter }: ProjectHeadProps) {
  // Aggregate team metrics for the selected quarter
  let totalRevenueCurrent = 0;
  let totalRevenueTarget = 0;
  let totalSeatsCurrent = 0;
  let totalSeatsTarget = 0;
  let totalPipelineCurrent = 0;
  let totalPipelineTarget = 0;

  users.forEach((user) => {
    const quarterly = (user as any).quarterlyMetrics;
    const metrics = quarterly ? quarterly[selectedQuarter] : user.metrics;
    
    if (metrics) {
      totalRevenueCurrent += metrics.revenue.current || 0;
      totalRevenueTarget += metrics.revenue.target || 0;
      totalSeatsCurrent += metrics.seats.current || 0;
      totalSeatsTarget += metrics.seats.target || 0;
      totalPipelineCurrent += metrics.pipeline.current || 0;
      totalPipelineTarget += metrics.pipeline.target || 0;
    }
  });

  // Calculate percentages
  const revPercentage = totalRevenueTarget > 0 ? Math.round((totalRevenueCurrent / totalRevenueTarget) * 100) : 0;
  const seatsPercentage = totalSeatsTarget > 0 ? Math.round((totalSeatsCurrent / totalSeatsTarget) * 100) : 0;
  const pipePercentage = totalPipelineTarget > 0 ? Math.round((totalPipelineCurrent / totalPipelineTarget) * 100) : 0;

  // Format currency helpers
  const formatIndianCurrency = (num: number) => {
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Pie chart datasets
  const revenueData = [
    { name: 'Revenue Achieved', value: totalRevenueCurrent, color: '#006c49' }, // Green (secondary)
    { name: 'Remaining Target', value: Math.max(0, totalRevenueTarget - totalRevenueCurrent), color: '#ba1a1a' } // Red (error)
  ];

  const seatsData = [
    { name: 'Seats Booked', value: totalSeatsCurrent, color: '#4edea3' }, // Bright Green
    { name: 'Remaining Seats', value: Math.max(0, totalSeatsTarget - totalSeatsCurrent), color: '#ffd6d6' } // Soft Red
  ];

  // Contribution data per recruiter
  const recruiterContributions = users.map((user) => {
    const quarterly = (user as any).quarterlyMetrics;
    const metrics = quarterly ? quarterly[selectedQuarter] : user.metrics;
    return {
      name: user.name,
      avatarUrl: user.avatarUrl,
      revenue: metrics?.revenue?.current || 0,
      seats: metrics?.seats?.current || 0
    };
  });

  return (
    <div className="w-full flex flex-col gap-8 font-body-md text-on-surface">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-surface-container-low/40 border border-outline-variant/20 rounded-2xl p-5 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cumulative Revenue</span>
          <div className="text-[24px] font-bold text-secondary">
            {formatIndianCurrency(totalRevenueCurrent)}
          </div>
          <span className="text-[11px] text-on-surface-variant/80 font-medium">
            Goal: {formatIndianCurrency(totalRevenueTarget)} ({revPercentage}% reached)
          </span>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              style={{ width: `${revPercentage}%` }} 
              className={`h-full rounded-full ${revPercentage >= 80 ? 'bg-secondary' : 'bg-error'}`}
            />
          </div>
        </div>

        {/* Seats Card */}
        <div className="bg-surface-container-low/40 border border-outline-variant/20 rounded-2xl p-5 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cumulative Seats Booked</span>
          <div className="text-[24px] font-bold text-primary">
            {totalSeatsCurrent} Seats
          </div>
          <span className="text-[11px] text-on-surface-variant/80 font-medium">
            Goal: {totalSeatsTarget} Seats ({seatsPercentage}% reached)
          </span>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              style={{ width: `${seatsPercentage}%` }} 
              className={`h-full rounded-full ${seatsPercentage >= 80 ? 'bg-secondary' : 'bg-error'}`}
            />
          </div>
        </div>

        {/* Pipeline Card */}
        <div className="bg-surface-container-low/40 border border-outline-variant/20 rounded-2xl p-5 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cumulative Pipeline</span>
          <div className="text-[24px] font-bold text-primary">
            {formatIndianCurrency(totalPipelineCurrent)}
          </div>
          <span className="text-[11px] text-on-surface-variant/80 font-medium">
            Goal: {formatIndianCurrency(totalPipelineTarget)} ({pipePercentage}% reached)
          </span>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              style={{ width: `${pipePercentage}%` }} 
              className={`h-full rounded-full ${pipePercentage >= 80 ? 'bg-secondary' : 'bg-error'}`}
            />
          </div>
        </div>
      </div>

      {/* Pie Chart Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Revenue Pie Chart */}
        <div className="bg-surface-container-lowest/80 border border-outline-variant/25 rounded-2xl p-6 shadow-md flex flex-col items-center">
          <h4 className="font-bold text-sm text-on-surface-variant mb-4 uppercase tracking-wider">Cumulative Revenue Share</h4>
          <div className="w-full h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatIndianCurrency(value)}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #c5c6cd' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[10px] text-on-surface-variant/60 text-center mt-2 font-medium">
            Displays current completed billing targets vs remaining gap.
          </span>
        </div>

        {/* Seats Donut Chart */}
        <div className="bg-surface-container-lowest/80 border border-outline-variant/25 rounded-2xl p-6 shadow-md flex flex-col items-center">
          <h4 className="font-bold text-sm text-on-surface-variant mb-4 uppercase tracking-wider">Cumulative Seats Booked</h4>
          <div className="w-full h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seatsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {seatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `${value} Seats`}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #c5c6cd' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[10px] text-on-surface-variant/60 text-center mt-2 font-medium">
            Displays confirmed seats filled vs remaining open seats.
          </span>
        </div>
      </div>

      {/* Recruiter Contributions table */}
      <div className="bg-surface-container-lowest/80 border border-outline-variant/25 rounded-2xl p-6 shadow-md">
        <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4">
          Individual Recruiter Contributions
        </h4>
        <div className="flex flex-col gap-3">
          {recruiterContributions.map((recruiter) => {
            const revContribShare = totalRevenueCurrent > 0 
              ? Math.round((recruiter.revenue / totalRevenueCurrent) * 100) 
              : 0;

            return (
              <div 
                key={recruiter.name}
                className="flex items-center justify-between p-3.5 border border-outline-variant/15 bg-surface-container-low/20 rounded-xl hover:bg-surface-container-low/40 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    className="w-8 h-8 rounded-full object-cover border border-outline-variant/35"
                    src={recruiter.avatarUrl}
                    alt={recruiter.name}
                  />
                  <div>
                    <h5 className="text-body-md font-bold text-on-surface leading-tight">{recruiter.name}</h5>
                    <p className="text-[9px] text-on-surface-variant/75 font-semibold mt-0.5">
                      Share: {revContribShare}% of team revenue
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-secondary">
                    {formatIndianCurrency(recruiter.revenue)}
                  </span>
                  <span className="text-[10px] text-on-surface-variant/80 font-bold">
                    {recruiter.seats} seats
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
