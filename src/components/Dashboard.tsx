import React from 'react';
import { Subject, ActiveTab, MasteryLevel } from '../types';
import { translations } from '../translations';
import {
  calculateGlobalStats,
  calculateSubjectStats,
  getDaysUntilExam
} from '../utils/helpers';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  Star
} from 'lucide-react';

interface DashboardProps {
  subjects: Subject[];
  streak: number;
  lang: 'en' | 'ar';
  setActiveTab: (tab: ActiveTab) => void;
  onUpdateTopicMastery: (
    subjectId: string,
    chapterId: string,
    lectureId: string,
    topicId: string,
    level: MasteryLevel
  ) => void;
  onSelectSubjectForCurriculum: (subjectId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  subjects,
  streak,
  lang,
  setActiveTab,
  onUpdateTopicMastery,
  onSelectSubjectForCurriculum
}) => {
  const t = translations[lang];
  const globalStats = calculateGlobalStats(subjects);

  // Pie chart data for overall mastery
  const pieData = [
    { name: t.weak, value: globalStats.weakCount, color: '#EF4444' },
    { name: t.good, value: globalStats.goodCount, color: '#F59E0B' },
    { name: t.excellent, value: globalStats.excellentCount, color: '#10B981' },
    { name: t.unrated, value: globalStats.unratedCount, color: '#94A3B8' }
  ].filter((d) => d.value > 0);

  // Stacked Bar chart data per subject
  const subjectBarData = subjects.map((sub) => {
    const stats = calculateSubjectStats(sub);
    return {
      name: sub.name.length > 20 ? sub.name.substring(0, 18) + '...' : sub.name,
      fullName: sub.name,
      weak: stats.weakCount,
      good: stats.goodCount,
      excellent: stats.excellentCount,
      unrated: stats.unratedCount,
      id: sub.id
    };
  });

  // Upcoming Exams
  const subjectsWithExams = subjects
    .map((sub) => {
      const examInfo = getDaysUntilExam(sub.examDate);
      const stats = calculateSubjectStats(sub);
      return {
        subject: sub,
        examInfo,
        stats
      };
    })
    .filter((item) => item.examInfo.status !== 'none')
    .sort((a, b) => a.examInfo.days - b.examInfo.days);

  // Priority Weak Topics (High-Yield first)
  const allWeakTopics: {
    subjectId: string;
    subjectName: string;
    chapterId: string;
    lectureId: string;
    lectureName: string;
    isHighYield: boolean;
    topicId: string;
    topicName: string;
  }[] = [];

  subjects.forEach((sub) => {
    sub.chapters.forEach((chap) => {
      chap.lectures.forEach((lec) => {
        lec.topics.forEach((top) => {
          if (top.masteryLevel === 'weak') {
            allWeakTopics.push({
              subjectId: sub.id,
              subjectName: sub.name,
              chapterId: chap.id,
              lectureId: lec.id,
              lectureName: lec.name,
              isHighYield: lec.isHighYield,
              topicId: top.id,
              topicName: top.name
            });
          }
        });
      });
    });
  });

  // Sort weak topics: High-Yield first
  allWeakTopics.sort((a, b) => (b.isHighYield ? 1 : 0) - (a.isHighYield ? 1 : 0));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Empty State Banner when 0 subjects */}
      {subjects.length === 0 && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm text-center max-w-2xl mx-auto space-y-4 my-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              {lang === 'ar' ? 'مرحباً بك في MedDiagnostic Hub' : 'Welcome to MedDiagnostic Hub'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {lang === 'ar'
                ? 'ابدأ بإضافة أول مادة طبية لك لمتابعة المحاضرات، والمواضيع المهمة (High-Yield)، وتقييم الفجوات التشخيصية قبل الامتحانات.'
                : 'Start tracking your medical curriculum by adding your first subject to organize chapters, lectures, high-yield topics, and review weak points.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('curriculum')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 dark:shadow-none inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'ar' ? '+ إضافة أول مادة' : '+ Add Your First Subject'}</span>
          </button>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {/* Total Topics */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{t.totalTopicsTracked}</p>
            <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{globalStats.totalTopics}</p>
          </div>
        </div>

        {/* Overall Mastery Rate */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{t.overallMastery}</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{globalStats.masteryPercentage}%</p>
          </div>
        </div>

        {/* Weak Sub-Topics */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/60 rounded-2xl flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider">{t.weakTopicsCount}</p>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{globalStats.weakCount}</p>
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/60 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{t.taskCompletionRate}</p>
            <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {globalStats.taskCompletionPercentage}%
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg shadow-orange-500/20 col-span-2 md:col-span-1 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-amber-100 shrink-0">
            <Flame className="w-6 h-6 fill-amber-100 animate-bounce" />
          </div>
          <div>
            <p className="text-[10px] text-amber-100 font-bold uppercase tracking-wider">{t.currentStreak}</p>
            <p className="text-xl font-black mt-0.5">{streak} <span className="text-xs font-normal opacity-90">{t.daysStreak}</span></p>
          </div>
        </div>
      </div>

      {/* Exam Countdown Banners if any */}
      {subjectsWithExams.length > 0 && (
        <div className="bg-slate-900 dark:bg-slate-800/90 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2 text-indigo-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {t.upcomingExamsCount}
            </h2>
            <button
              onClick={() => setActiveTab('exams')}
              className="text-xs text-indigo-300 hover:text-white font-medium flex items-center gap-1 transition"
            >
              <span>{t.countdownTitle}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectsWithExams.map(({ subject, examInfo, stats }) => (
              <div
                key={subject.id}
                onClick={() => onSelectSubjectForCurriculum(subject.id)}
                className="cursor-pointer bg-slate-800/90 hover:bg-slate-700/90 p-4 rounded-xl border border-slate-700 transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: subject.color }}
                    />
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {subject.name}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span className="text-rose-400 font-semibold">
                      {stats.weakCount} {t.weakTopicsRemaining}
                    </span>
                    <span>•</span>
                    <span>{stats.masteryPercentage}% {t.goodTopics}</span>
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  {examInfo.status === 'today' ? (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs animate-pulse">
                      {t.todayExam}
                    </span>
                  ) : examInfo.status === 'future' ? (
                    <div className="text-center bg-indigo-950/80 border border-indigo-800/60 px-3 py-1.5 rounded-xl">
                      <span className="text-base font-black text-indigo-300 block leading-none">
                        {examInfo.days}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-medium">
                        {t.daysLeft}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">{t.examPassed}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Overall Mastery Distribution */}
        <div className="bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">
              {t.overallMastery}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Diagnostic breakdown across all sub-topics
            </p>
          </div>

          <div className="h-60 w-full my-4 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '16px',
                      color: '#FFF',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs">
                No topic data logged yet
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800 dark:text-white">
                {globalStats.masteryPercentage}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                Mastered
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>{t.weak}: <strong className="text-slate-800 dark:text-white">{globalStats.weakCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>{t.good}: <strong className="text-slate-800 dark:text-white">{globalStats.goodCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{t.excellent}: <strong className="text-slate-800 dark:text-white">{globalStats.excellentCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>{t.unrated}: <strong className="text-slate-800 dark:text-white">{globalStats.unratedCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Stacked Bar Chart per Subject */}
        <div className="bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">
              {t.subjectProgress}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Sub-topic count breakdown per subject
            </p>
          </div>

          <div className="h-64 w-full my-4">
            {subjectBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '16px',
                      color: '#FFF',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="weak" stackId="a" fill="#EF4444" name={t.weak} />
                  <Bar dataKey="good" stackId="a" fill="#F59E0B" name={t.good} />
                  <Bar dataKey="excellent" stackId="a" fill="#10B981" name={t.excellent} />
                  <Bar dataKey="unrated" stackId="a" fill="#94A3B8" name={t.unrated} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                {t.noSubjectsYet}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 text-center font-medium">
            Click on any subject card below to view its chapters and sub-topics.
          </div>
        </div>
      </div>

      {/* Priority Weak Topics Preview Box */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              {t.quickWeakTriage}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Sub-topics currently rated as "Needs Review". High-yield topics are prioritized.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('triage')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{t.viewAllWeak} ({allWeakTopics.length})</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        {allWeakTopics.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
            <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              {t.noWeakTopics}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allWeakTopics.slice(0, 6).map((item) => (
              <div
                key={item.topicId}
                className="p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col justify-between gap-3 group hover:border-rose-300 dark:hover:border-rose-800 transition relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-rose-400"></div>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate">
                      {item.subjectName}
                    </span>
                    {item.isHighYield && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-white dark:bg-slate-900 text-rose-600 shadow-sm border border-rose-100 dark:border-rose-950 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-rose-500 text-rose-500" />
                        {t.highYieldBadge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {item.topicName}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate font-medium">
                    {item.lectureName}
                  </p>
                </div>

                {/* Quick Rating Upgrade Pills */}
                <div className="flex items-center justify-between pt-2 border-t border-rose-100/60 dark:border-rose-900/30 text-[10px]">
                  <span className="text-slate-400 font-medium">Re-rate:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onUpdateTopicMastery(
                          item.subjectId,
                          item.chapterId,
                          item.lectureId,
                          item.topicId,
                          'good'
                        )
                      }
                      className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-300 font-semibold transition"
                    >
                      {t.good}
                    </button>
                    <button
                      onClick={() =>
                        onUpdateTopicMastery(
                          item.subjectId,
                          item.chapterId,
                          item.lectureId,
                          item.topicId,
                          'excellent'
                        )
                      }
                      className="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 font-semibold transition"
                    >
                      {t.excellent}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
