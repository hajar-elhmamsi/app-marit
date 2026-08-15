import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'neutral' | 'warning';
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendType = 'positive',
  icon: Icon,
}) => {
  const trendColor = {
    positive: 'text-[#16A34A] bg-[#DCFCE7]',
    warning: 'text-[#B45309] bg-[#FEF3C7]',
    neutral: 'text-[#0B4F8A] bg-[#EAF4FB]',
  }[trendType];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            {title}
          </span>
          <div className="text-3xl font-bold text-[#123B63] tracking-tight pt-1">
            {value}
          </div>
        </div>

        <div className="w-10 h-10 rounded-lg bg-[#EAF4FB] text-[#0B4F8A] flex items-center justify-center flex-shrink-0">
          <Icon size={20} className="stroke-[2.2]" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
          {subtitle && <span className="text-[#64748B] font-medium">{subtitle}</span>}
          {trend && (
            <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${trendColor}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
