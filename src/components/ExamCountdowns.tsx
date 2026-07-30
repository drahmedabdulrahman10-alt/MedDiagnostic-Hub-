import React, { useState } from 'react';
import { Subject } from '../types';
import { translations } from '../translations';
import { calculateSubjectStats, getDaysUntilExam } from '../utils/helpers';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Award, ArrowRight } from 'lucide-react';

interface ExamCountdownsProps {
  subjects: Subject[];
  lang: 'en' | 'ar';
  onUpdateSubject: (subject: Subject) => void;
  onSelectSubjectForCurriculum: (subjectId: string) => void;
}

export const ExamCountdowns: React.FC<ExamCountdownsProps> = ({
  subjects,
  lang,
  onUpdateSubject,
  onSelectSubjectForCurriculum
}) => {
  const t = translations[lang];

  const [editingExamSubId, setEditingExamSubId] = useState<string | null>(null);
  const [newExamDateInput, setNewExamDateInput] = useState<string>('');

  const handleSaveExamDate = (subject: Subject) => {
    onUpdateSubject({
      ...subject,
      examDate: newExamDateInput || undefined
    });
    setEditingExamSubId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
              {t.countdownTitle}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Track days remaining until medical exams & monitor weak sub-topic reduction.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Subject Exam Cards */}
      {subjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">
              No Exam Countdowns
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Add medical subjects in the Curriculum tab to set exam dates and monitor days remaining.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => {
          const examInfo = getDaysUntilExam(sub.examDate);
          const stats = calculateSubjectStats(sub);
          const isEditing = editingExamSubId === sub.id;

          return (
            <div
              key={sub.id}
              className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden flex flex-col justify-between gap-4"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: sub.color }}
              />

              <div>
                {/* Subject name & color */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {sub.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setEditingExamSubId(isEditing ? null : sub.id);
                      setNewExamDateInput(sub.examDate || '');
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                  >
                    {sub.examDate ? 'Edit Date' : '+ Set Date'}
                  </button>
                </div>

                {/* Date Editing Form */}
                {isEditing ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 mb-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t.examDate}
                    </label>
                    <input
                      type="date"
                      value={newExamDateInput}
                      onChange={(e) => setNewExamDateInput(e.target.value)}
                      className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingExamSubId(null)}
                        className="px-2 py-1 text-xs text-slate-500"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveExamDate(sub)}
                        className="px-3 py-1 bg-indigo-600 text-white font-bold rounded text-xs"
                      >
                        {t.save}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Countdown Display */
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center mb-4">
                    {examInfo.status === 'today' ? (
                      <div className="py-2">
                        <span className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-black text-sm animate-pulse">
                          {t.todayExam}
                        </span>
                      </div>
                    ) : examInfo.status === 'future' ? (
                      <div>
                        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                          {examInfo.days}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                          {t.daysLeft} ({sub.examDate})
                        </div>
                      </div>
                    ) : examInfo.status === 'passed' ? (
                      <div className="text-xs font-semibold text-slate-400">
                        {t.examPassed} ({sub.examDate})
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 py-2">
                        {t.setExamDate}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Topic Triage Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span>{t.weak}</span>
                    </span>
                    <span>{stats.weakCount} sub-topics</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{t.good} / {t.excellent}</span>
                    </span>
                    <span>{stats.goodCount + stats.excellentCount} sub-topics ({stats.masteryPercentage}%)</span>
                  </div>
                </div>
              </div>

              {/* Jump to subject curriculum */}
              <button
                onClick={() => onSelectSubjectForCurriculum(sub.id)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>{t.curriculum}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
