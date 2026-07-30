import React, { useState } from 'react';
import { Subject, Chapter, Lecture } from '../types';
import { translations } from '../translations';
import { calculateSubjectStats, getDaysUntilExam } from '../utils/helpers';
import { LectureCard } from './LectureCard';
import {
  Plus,
  BookOpen,
  FolderPlus,
  Calendar,
  Sparkles,
  Trash2,
  Edit,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';

interface SubjectCurriculumProps {
  subjects: Subject[];
  selectedSubjectId?: string;
  lang: 'en' | 'ar';
  onAddSubject: (name: string, color: string, examDate?: string) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

interface ConfirmDeleteTarget {
  type: 'subject' | 'chapter' | 'lecture';
  id: string;
  name: string;
  extraId?: string; // chapterId when type is lecture
}

export const SubjectCurriculum: React.FC<SubjectCurriculumProps> = ({
  subjects,
  selectedSubjectId,
  lang,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject
}) => {
  const t = translations[lang];

  const [activeSubId, setActiveSubId] = useState<string>(
    selectedSubjectId || (subjects.length > 0 ? subjects[0].id : '')
  );

  // Modals / Inline forms
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#6366F1');
  const [newSubExamDate, setNewSubExamDate] = useState('');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ConfirmDeleteTarget | null>(null);

  // Editing subject
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editSubName, setEditSubName] = useState('');
  const [editSubColor, setEditSubColor] = useState('#6366F1');
  const [editSubExamDate, setEditSubExamDate] = useState('');

  // Chapter forms
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapName, setNewChapName] = useState('');

  // Lecture form per chapter ID
  const [addingLectureChapId, setAddingLectureChapId] = useState<string | null>(null);
  const [newLecName, setNewLecName] = useState('');
  const [newLecNotes, setNewLecNotes] = useState('');
  const [newLecHighYield, setNewLecHighYield] = useState(false);

  // Active Subject
  const currentSubject = subjects.find((s) => s.id === activeSubId) || subjects[0];

  // Color palette options
  const colorOptions = [
    '#6366F1', // Indigo
    '#059669', // Emerald
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#14B8A6'  // Teal
  ];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    onAddSubject(newSubName.trim(), newSubColor, newSubExamDate || undefined);
    setNewSubName('');
    setNewSubExamDate('');
    setIsAddingSubject(false);
  };

  const handleStartEditSubject = () => {
    if (!currentSubject) return;
    setEditSubName(currentSubject.name);
    setEditSubColor(currentSubject.color);
    setEditSubExamDate(currentSubject.examDate || '');
    setIsEditingSubject(true);
  };

  const handleSaveSubjectEdit = () => {
    if (!currentSubject || !editSubName.trim()) return;
    onUpdateSubject({
      ...currentSubject,
      name: editSubName.trim(),
      color: editSubColor,
      examDate: editSubExamDate || undefined
    });
    setIsEditingSubject(false);
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject || !newChapName.trim()) return;

    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      name: newChapName.trim(),
      lectures: []
    };

    onUpdateSubject({
      ...currentSubject,
      chapters: [...currentSubject.chapters, newChapter]
    });

    setNewChapName('');
    setIsAddingChapter(false);
  };

  const executeDeleteTarget = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'subject') {
      onDeleteSubject(deleteTarget.id);
    } else if (deleteTarget.type === 'chapter') {
      if (currentSubject) {
        onUpdateSubject({
          ...currentSubject,
          chapters: currentSubject.chapters.filter((c) => c.id !== deleteTarget.id)
        });
      }
    } else if (deleteTarget.type === 'lecture') {
      if (currentSubject && deleteTarget.extraId) {
        const chapId = deleteTarget.extraId;
        const updatedChapters = currentSubject.chapters.map((chap) =>
          chap.id === chapId
            ? { ...chap, lectures: chap.lectures.filter((l) => l.id !== deleteTarget.id) }
            : chap
        );
        onUpdateSubject({ ...currentSubject, chapters: updatedChapters });
      }
    }

    setDeleteTarget(null);
  };

  const handleAddLecture = (chapId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject || !newLecName.trim()) return;

    const newLecture: Lecture = {
      id: `lec-${Date.now()}`,
      name: newLecName.trim(),
      notes: newLecNotes.trim() || undefined,
      isHighYield: newLecHighYield,
      dateFirstStudied: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      tasks: [],
      topics: []
    };

    const updatedChapters = currentSubject.chapters.map((chap) =>
      chap.id === chapId
        ? { ...chap, lectures: [...chap.lectures, newLecture] }
        : chap
    );

    onUpdateSubject({ ...currentSubject, chapters: updatedChapters });

    setNewLecName('');
    setNewLecNotes('');
    setNewLecHighYield(false);
    setAddingLectureChapId(null);
  };

  const handleUpdateLecture = (chapId: string, updatedLec: Lecture) => {
    if (!currentSubject) return;
    const updatedChapters = currentSubject.chapters.map((chap) =>
      chap.id === chapId
        ? {
            ...chap,
            lectures: chap.lectures.map((l) => (l.id === updatedLec.id ? updatedLec : l))
          }
        : chap
    );
    onUpdateSubject({ ...currentSubject, chapters: updatedChapters });
  };

  const stats = currentSubject ? calculateSubjectStats(currentSubject) : null;
  const examInfo = currentSubject ? getDaysUntilExam(currentSubject.examDate) : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subject Tabs Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {subjects.map((sub) => {
            const isActive = sub.id === currentSubject?.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setActiveSubId(sub.id);
                  setIsEditingSubject(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>

        {/* Add Subject Button */}
        <button
          onClick={() => setIsAddingSubject(true)}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addSubject}</span>
        </button>
      </div>

      {/* Add Subject Modal */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleCreateSubject} className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              {t.addSubject}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.subjectName}
              </label>
              <input
                type="text"
                required
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="e.g. Pathology - Endocrine System"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.subjectColor}
              </label>
              <div className="flex items-center gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewSubColor(c)}
                    className={`w-7 h-7 rounded-full transition transform ${
                      newSubColor === c ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.examDate}
              </label>
              <input
                type="date"
                value={newSubExamDate}
                onChange={(e) => setNewSubExamDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingSubject(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Subject Main View */}
      {currentSubject ? (
        <div className="space-y-6">
          {/* Subject Header Banner */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: currentSubject.color }}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {isEditingSubject ? (
                <div className="space-y-3 flex-1">
                  <input
                    type="text"
                    value={editSubName}
                    onChange={(e) => setEditSubName(e.target.value)}
                    className="w-full text-lg font-bold p-2 rounded bg-slate-50 dark:bg-slate-900 border border-indigo-500 text-slate-900 dark:text-white"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={editSubExamDate}
                      onChange={(e) => setEditSubExamDate(e.target.value)}
                      className="p-1.5 text-xs rounded bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                    />
                    <div className="flex gap-1">
                      {colorOptions.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditSubColor(c)}
                          className={`w-5 h-5 rounded-full ${editSubColor === c ? 'ring-2 ring-indigo-500' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleSaveSubjectEdit}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                    >
                      {t.save}
                    </button>
                    <button
                      onClick={() => setIsEditingSubject(false)}
                      className="px-3 py-1 bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {currentSubject.name}
                    </h2>
                    <button
                      onClick={handleStartEditSubject}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      title={t.editSubject}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'subject',
                          id: currentSubject.id,
                          name: currentSubject.name
                        })
                      }
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title={t.deleteSubject}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sub stats */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {stats && (
                      <>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {stats.totalTopics} {t.totalTopicsTracked}
                        </span>
                        <span>•</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          {stats.weakCount} {t.weak}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {stats.masteryPercentage}% {t.goodTopics}
                        </span>
                      </>
                    )}

                    {examInfo && examInfo.status !== 'none' && (
                      <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" />
                        {examInfo.status === 'today'
                          ? t.todayExam
                          : `${examInfo.days} ${t.daysLeft}`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Add Chapter Button */}
              {!isEditingSubject && (
                <button
                  onClick={() => setIsAddingChapter(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition flex items-center gap-2 shrink-0"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{t.addChapter}</span>
                </button>
              )}
            </div>

            {/* Add Chapter inline form */}
            {isAddingChapter && (
              <form onSubmit={handleAddChapter} className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <input
                  type="text"
                  required
                  value={newChapName}
                  onChange={(e) => setNewChapName(e.target.value)}
                  placeholder={t.chapterName + " (e.g. Thyroid Gland Disorders)"}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingChapter(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                  >
                    {t.addChapter}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Chapters List */}
          <div className="space-y-8">
            {currentSubject.chapters.map((chap) => (
              <div key={chap.id} className="space-y-4">
                {/* Chapter Heading */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-md inline-block"
                      style={{ backgroundColor: currentSubject.color }}
                    />
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                      {chap.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-normal">
                      ({chap.lectures.length} lectures)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddingLectureChapId(chap.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addLecture}</span>
                    </button>

                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'chapter',
                          id: chap.id,
                          name: chap.name
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add Lecture Form for this chapter */}
                {addingLectureChapId === chap.id && (
                  <form
                    onSubmit={(e) => handleAddLecture(chap.id, e)}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <input
                      type="text"
                      required
                      value={newLecName}
                      onChange={(e) => setNewLecName(e.target.value)}
                      placeholder={t.lectureName + " (e.g. Hyperthyroidism & Thyroiditis)"}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      autoFocus
                    />

                    <textarea
                      rows={2}
                      value={newLecNotes}
                      onChange={(e) => setNewLecNotes(e.target.value)}
                      placeholder={t.notes + " (Optional summary/key exam pointers)"}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newLecHighYield}
                          onChange={(e) => setNewLecHighYield(e.target.checked)}
                          className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                        />
                        <span>{t.highYield}</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAddingLectureChapId(null)}
                          className="px-3 py-1.5 text-xs text-slate-500"
                        >
                          {t.cancel}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                        >
                          {t.addLecture}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Lectures List */}
                <div className="space-y-4">
                  {chap.lectures.map((lecture) => (
                    <LectureCard
                      key={lecture.id}
                      lecture={lecture}
                      subjectId={currentSubject.id}
                      chapterId={chap.id}
                      lang={lang}
                      onUpdateLecture={(updated) => handleUpdateLecture(chap.id, updated)}
                      onDeleteLecture={() =>
                        setDeleteTarget({
                          type: 'lecture',
                          id: lecture.id,
                          name: lecture.name,
                          extraId: chap.id
                        })
                      }
                    />
                  ))}

                  {chap.lectures.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      No lectures added to this chapter yet. Click "+ Add Lecture" above!
                    </div>
                  )}
                </div>
              </div>
            ))}

            {currentSubject.chapters.length === 0 && (
              <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <FolderPlus className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No chapters in this subject
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Add chapters (e.g. Thyroid, Adrenal, Cardiac) to organize your lectures and sub-topics.
                </p>
                <button
                  onClick={() => setIsAddingChapter(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addChapter}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">
              {t.noSubjectsYet}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Create your medical subjects (e.g. Cardiology, Pharmacology, Pathology) to start building your study curriculum.
            </p>
          </div>
          <button
            onClick={() => setIsAddingSubject(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addSubject}</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه.' : 'This action cannot be undone.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {lang === 'ar'
                ? `هل أنت أذكر أنك تريد حذف ${deleteTarget.type === 'subject' ? 'المادة' : deleteTarget.type === 'chapter' ? 'الفصل' : 'المحاضرة'} "${deleteTarget.name}"؟`
                : `Are you sure you want to delete the ${deleteTarget.type} "${deleteTarget.name}"?`}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={executeDeleteTarget}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-600/20"
              >
                {t.confirmDelete || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
