import React from 'react';
import { DailyActivityLog } from '../types';
import { translations } from '../translations';
import { Flame, Calendar, Award } from 'lucide-react';

interface ActivityHeatmapProps {
  activityLogs: DailyActivityLog;
  streak: number;
  lang: 'en' | 'ar';
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activityLogs,
  streak,
  lang
}) => {
  const t = translations[lang];

  // Generate grid for past 24 weeks (168 days)
  const weeksCount = 24;
  const days: { dateStr: string; count: number; date: Date }[] = [];
  const today = new Date();

  for (let i = weeksCount * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      dateStr,
      count: activityLogs[dateStr] || 0,
      date: d
    });
  }

  // Get color intensity
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50';
    if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-800';
    if (count <= 4) return 'bg-emerald-400 dark:bg-emerald-700 border-emerald-500 dark:border-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-400';
  };

  const totalActivities = (Object.values(activityLogs) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Streak Header Box */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Flame className="w-8 h-8 text-amber-100 fill-amber-100 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
              {t.streakTitle}
            </span>
            <h2 className="text-2xl font-black text-white">
              {streak} {t.daysStreak}
            </h2>
            <p className="text-xs text-amber-100/90 mt-0.5 font-medium">
              {t.streakMessage}
            </p>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-right rtl:text-left shrink-0">
          <div className="text-2xl font-black">{totalActivities}</div>
          <div className="text-[10px] text-amber-200 uppercase font-bold">
            Total Study Logged Actions
          </div>
        </div>
      </div>

      {/* GitHub-style Heatmap Calendar */}
      <div className="bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Activity Log (Past 24 Weeks)</span>
          </h3>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{t.lessActivity}</span>
            <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border" />
            <span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900/60" />
            <span className="w-3 h-3 rounded bg-emerald-400 dark:bg-emerald-700" />
            <span className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-500" />
            <span>{t.moreActivity}</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px] pt-2">
          {days.map((d) => (
            <div
              key={d.dateStr}
              title={`${d.count} ${t.activitiesCount} ${d.dateStr}`}
              className={`w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 hover:z-10 cursor-pointer ${getCellColor(
                d.count
              )}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
