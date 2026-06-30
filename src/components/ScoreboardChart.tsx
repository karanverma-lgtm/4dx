'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Metric } from '../data/mockData';

interface ScoreboardChartProps {
  weeklyHistory: any[];
  metrics: {
    revenue: Metric;
    pipeline: Metric;
    seats: Metric;
  };
  goalFilter: string;
}

export default function ScoreboardChart({
  weeklyHistory = [],
  metrics,
  goalFilter
}: ScoreboardChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-72 w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-[28px] text-primary animate-spin">
          autorenew
        </span>
      </div>
    );
  }

  // Format utility for Indian Rupee Lakhs/Crores
  const formatIndianCurrency = (value: number) => {
    if (value >= 10000000) {
      return '₹' + (value / 10000000).toFixed(2) + ' Cr';
    }
    if (value >= 100000) {
      return '₹' + (value / 100000).toFixed(1) + ' Lakhs';
    }
    return '₹' + value.toLocaleString('en-IN');
  };

  const formatShortValue = (value: number, type: 'currency' | 'seats') => {
    if (type === 'seats') return `${value}`;
    if (value >= 100000) {
      return '₹' + (value / 100000).toFixed(1) + 'L';
    }
    return '₹' + value.toLocaleString('en-IN');
  };

  // Define chart configurations based on WIG type
  const chartConfigs = {
    revenue: {
      dataKey: 'revenue',
      title: 'Revenue WIG Trend',
      target: metrics.revenue.target,
      color: '#006c49', // Emerald/Success
      gradientId: 'colorRevenue',
      type: 'currency' as const
    },
    pipeline: {
      dataKey: 'pipeline',
      title: 'Pipeline WIG Trend',
      target: metrics.pipeline.target,
      color: '#ba1a1a', // Rose/Alert
      gradientId: 'colorPipeline',
      type: 'currency' as const
    },
    seats: {
      dataKey: 'seats',
      title: 'Seat Bookings WIG Trend',
      target: metrics.seats.target,
      color: '#091426', // Slate Primary
      gradientId: 'colorSeats',
      type: 'seats' as const
    }
  };

  const renderSingleChart = (type: 'revenue' | 'pipeline' | 'seats', height = 280) => {
    const config = chartConfigs[type];
    const targetVal = config.target;

    return (
      <div className="bg-surface-container-lowest/60 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col gap-4 relative overflow-hidden group">
        <div className="flex justify-between items-center z-10 relative">
          <div>
            <h4 className="font-headline-md text-[16px] font-bold text-on-surface">
              {config.title}
            </h4>
            <p className="text-[11px] text-on-surface-variant font-body-sm mt-0.5">
              Weekly progress vs. target milestone
            </p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant block">Target</span>
              <span className="text-xs font-bold text-on-surface font-label-md">
                {config.type === 'currency' ? formatIndianCurrency(targetVal) : `${targetVal} seats`}
              </span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height }} className="z-10 relative">
          <ResponsiveContainer>
            <AreaChart
              data={weeklyHistory}
              margin={{ top: 15, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={config.color} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="week" 
                tickLine={false} 
                axisLine={false}
                dy={8}
                tick={{ fill: '#75777d', fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-inter)' }}
              />
              <YAxis 
                domain={[0, (dataMax: number) => Math.max(dataMax, targetVal) * 1.1]}
                tickFormatter={(v) => formatShortValue(v, config.type)}
                tickLine={false} 
                axisLine={false}
                dx={-8}
                tick={{ fill: '#75777d', fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-jetbrains-mono)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #c5c6cd',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  color: '#0b1c30'
                }}
                formatter={(value: any) => [
                  config.type === 'currency' ? formatIndianCurrency(Number(value)) : `${value} seats`,
                  'Current'
                ]}
                labelStyle={{ fontWeight: 'bold', color: '#091426', marginBottom: '4px' }}
              />
              <ReferenceLine 
                y={targetVal} 
                stroke={config.color} 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{
                  value: 'Target',
                  position: 'top',
                  fill: config.color,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              />
              <Area
                type="monotone"
                dataKey={config.dataKey}
                stroke={config.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${config.gradientId})`}
                activeDot={{ r: 6, strokeWidth: 0, fill: config.color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // If goalFilter is 'all', show a nice 3-column layout (or list) of mini charts
  if (goalFilter === 'all') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {renderSingleChart('revenue', 200)}
        {renderSingleChart('pipeline', 200)}
        {renderSingleChart('seats', 200)}
      </div>
    );
  }

  // Otherwise show single large focused chart matching the selected filter
  if (goalFilter === 'revenue' || goalFilter === 'pipeline' || goalFilter === 'seats') {
    return (
      <div className="mb-8">
        {renderSingleChart(goalFilter as 'revenue' | 'pipeline' | 'seats', 280)}
      </div>
    );
  }

  return null;
}
