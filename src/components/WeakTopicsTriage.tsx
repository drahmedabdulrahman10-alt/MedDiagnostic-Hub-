import React, { useState } from 'react';
import { Subject, MasteryLevel } from '../types';
import { translations } from '../translations';
import { formatRelativeTime } from '../utils/helpers';
import { AlertTriangle, Star, Printer, Clock, Sparkles, Filter } from 'lucide-react';

interface WeakTopicsTriageProps {
  subjects: Subject[];
  lang: 'en' | 'ar';
  onUpdateTopicMastery: (
    subjectId: string,
    chapterId: string,
    lectureId: string,
    topicId: string,
    level: MasteryLevel
  ) => void;
  onPrint: () => void;
}

export const WeakTopicsTriage: React.FC<WeakTopicsTriageProps> = ({
  subjects,
  lang,
  onUpdateTopicMastery,
  onPrint
}) => {
  const t = translations[lang];
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [onlyHighYield, setOnlyHighYield] = useState<boolean>(false);

  // Gather all weak topics
  interface WeakTopicItem {
    subjectId: string;
    subjectName: string;
    subjectColor: string;
    chapterId: string;
    chapterName: string;
    lectureId: string;
    lectureName: string;
    isHighYield: boolean;
    topicId: string;
    topicName: string;
    lastReviewed?: string;
  }

  const weakTopics: WeakTopicItem[] = [];

  subjects.forEach((sub) => {
    sub.chapters.forEach((chap) => {
      chap.lectures.forEach((lec) => {
        lec.topics.forEach((top) => {
          if (top.masteryLevel === 'weak') {
            weakTopics.push({
              subjectId: sub.id,
              subjectName: sub.name,
              subjectColor: sub.color,
              chapterId: chap.id,
              chapterName: chap.name,
              lectureId: lec.id,
              lectureName: lec.name,
              isHighYield: lec.isHighYield,
              topicId: top.id,
              topicName: top.name,
              lastReviewed: top.lastReviewed
            });
          }
        });
      });
    });
  });

  // Sort: High-Yield first
  weakTopics.sort((a, b) => (b.isHighYield ? 1 : 0) - (a.isHighYield ? 1 : 0));

  // Filter
  const filteredTopics = weakTopics.filter((item) => {
    if (filterSubjectId !== 'all' && item.subjectId !== filterSubjectId) return false;
    if (onlyHighYield && !item.isHighYield) return false;
    return true;
  });

  // Group by Subject
  const groupedBySubject = filteredTopics.reduce((acc, item) => {
    if (!acc[item.subjectId]) {
      acc[item.subjectId] = {
        subjectName: item.subjectName,
        subjectColor: item.subjectColor,
        items: []
      };
    }
    acc[item.subjectId].items.push(item);
    return acc;
  }, {} as { [subId: string]: { subjectName: string; subjectColor: string; items: WeakTopicItem[] } });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Triage Banner Header */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950 text-white rounded-3xl p-6 shadow-xl border border-rose-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Pre-Exam Self-Diagnostic Triage</span>
          </div>
          <h2 className="text-xl font-black text-white">
            {t.weakTopicsCount} ({weakTopics.length})
          </h2>
          <p className="text-xs text-rose-200/80 mt-1 max-w-2xl font-medium">
            This screen isolates all sub-topics rated "Needs Review" so you can fix your specific diagnostic gaps before taking past exams. High-yield topics are prioritized.
          </p>
        </div>

        <button
          onClick={onPrint}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2 shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>{t.printSummary}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Filter className="w-4 h-4 text-indigo-500" />
            <span>Filter Subject:</span>
          </div>

          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="all">All Medical Subjects ({weakTopics.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={onlyHighYield}
              onChange={(e) => setOnlyHighYield(e.target.checked)}
              className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
            />
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Only High Yield ({weakTopics.filter((x) => x.isHighYield).length})
            </span>
          </label>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredTopics.length} weak topics
        </span>
      </div>

      {/* Grouped Weak Topics List */}
      {Object.keys(groupedBySubject).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedBySubject).map(([subId, group]) => (
            <div
              key={subId}
              className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Subject Group Banner */}
              <div
                className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5"
                style={{ backgroundColor: `${group.subjectColor}15` }}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.subjectColor }}
                />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {group.subjectName}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                  {group.items.length} {t.weak}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 p-2">
                {group.items.map((item) => (
                  <div
                    key={item.topicId}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {item.isHighYield && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {t.highYieldBadge}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {item.topicName}
                        </h4>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>{item.chapterName}</span>
                        <span>•</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {item.lectureName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(item.lastReviewed, lang)}
                        </span>
                      </div>
                    </div>

                    {/* On-the-spot Mastery Upgrade Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <span className="text-xs font-medium text-slate-400">Upgrade:</span>
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
                        className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-300 font-bold text-xs transition"
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
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        {t.excellent}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t.noWeakTopics}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All sub-topics are currently rated Good or Excellent.
          </p>
        </div>
      )}
    </div>
  );
};
