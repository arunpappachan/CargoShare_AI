import React from 'react';
import { Box, TrendingDown, Globe, ShieldCheck } from 'lucide-react';
import CountUp from './common/CountUp';

const STATS = [
  {
    id: 'containers',
    icon: Box,
    iconColor: 'bg-brand-50 text-brand-600',
    value: 14850,
    suffix: '+',
    label: 'Containers Shared',
    subtext: 'LCL cargo consolidated',
  },
  {
    id: 'savings',
    icon: TrendingDown,
    iconColor: 'bg-emerald-50 text-emerald-600',
    value: 38.5,
    decimals: 1,
    suffix: '%',
    label: 'Avg. Cost Saved',
    subtext: 'Compared to whole TEU rates',
  },
  {
    id: 'countries',
    icon: Globe,
    iconColor: 'bg-blue-50 text-blue-600',
    value: 46,
    suffix: ' Ports',
    label: 'Global Trade Lanes',
    subtext: 'Connecting APAC, EU & Americas',
  },
  {
    id: 'accuracy',
    icon: ShieldCheck,
    iconColor: 'bg-indigo-50 text-indigo-600',
    value: 99.4,
    decimals: 1,
    suffix: '%',
    label: 'On-Time Dispatch',
    subtext: 'Carrier SLA fulfillment',
  },
];

export default function StatsSection() {
  return (
    <div className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6 sm:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.id}
                className={`flex items-start gap-4 ${idx !== 0 ? 'pt-6 sm:pt-0 sm:pl-8' : ''}`}
              >
                <div className={`p-3 rounded-2xl shrink-0 ${stat.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    <CountUp
                      end={stat.value}
                      decimals={stat.decimals || 0}
                      suffix={stat.suffix}
                      duration={2200}
                    />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mt-1">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
