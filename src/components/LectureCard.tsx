import React, { useState } from 'react';
import { Lecture, MasteryLevel, TaskType } from '../types';
import { translations } from '../translations';
import { calculateLectureStats } from '../utils/helpers';
import { TopicItem } from './TopicItem';
import { BulkTopicModal } from './BulkTopicModal';
import {
  Star,
  Plus,
  Sparkles,
  CheckSquare,
  FileText,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Trash2,
  Clock,
  ExternalLink
} from 'lucide-react';

interface LectureCardProps {
  lecture: Lecture;
  subjectId: string;
  chapterId: string;
  lang: 'en' | 'ar';
  onUpdateLecture: (updated: Lecture) => void;
  onDeleteLecture: () => void;
}

export const LectureCard: React.FC<LectureCardProps> = ({
  lecture,
  subjectId,
  chapterId,
  lang,
  onUpdateLecture,
  onDeleteLecture
}) => {
  const t = translations[lang];
  const [isExpanded, setIsExpanded] = useState(true);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [singleTopicName, setSingleTopicName] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('quiz');
  const [newTaskMins, setNewTaskMins] = useState<number | undefined>(20);

  // New link form state
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const stats = calculateLectureStats(lecture);

  // Toggle High Yield
  const handleToggleHighYield = () => {
    onUpdateLecture({
      ...lecture,
      isHighYield: !lecture.isHighYield
    });
  };

  // Add Single Topic
  const handleAddSingleTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTopicName.trim()) return;

    const newTopic = {
      id: `top-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: singleTopicName.trim(),
      masteryLevel: 'unrated' as MasteryLevel,
      lastReviewed: new Date().toISOString()
    };

    onUpdateLecture({
      ...lecture,
      topics: [...lecture.topics, newTopic],
      lastReviewed: new Date().toISOString()
    });

    setSingleTopicName('');
  };

  // Confirm Bulk Topics
  const handleConfirmBulkTopics = (topicNames: string[]) => {
    const newTopics = topicNames.map((name) => ({
      id: `top-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      masteryLevel: 'unrated' as MasteryLevel,
      lastReviewed: new Date().toISOString()
    }));

    onUpdateLecture({
      ...lecture,
      topics: [...lecture.topics, ...newTopics],
      lastReviewed: new Date().toISOString()
    });
  };

  // Topic mastery update
  const handleTopicMasteryUpdate = (topicId: string, level: MasteryLevel) => {
    const updatedTopics = lecture.topics.map((top) =>
      top.id === topicId
        ? { ...top, masteryLevel: level, lastReviewed: new Date().toISOString() }
        : top
    );

    onUpdateLecture({
      ...lecture,
      topics: updatedTopics,
      lastReviewed: new Date().toISOString()
    });
  };

  // Topic edit name
  const handleEditTopicName = (topicId: string, newName: string) => {
    const updatedTopics = lecture.topics.map((top) =>
      top.id === topicId ? { ...top, name: newName } : top
    );
    onUpdateLecture({ ...lecture, topics: updatedTopics });
  };

  // Topic delete
  const handleDeleteTopic = (topicId: string) => {
    const updatedTopics = lecture.topics.filter((top) => top.id !== topicId);
    onUpdateLecture({ ...lecture, topics: updatedTopics });
  };

  // Task toggle done
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = lecture.tasks.map((tk) =>
      tk.id === taskId
        ? { ...tk, done: !tk.done, dateCompleted: !tk.done ? new Date().toISOString() : undefined }
        : tk
    );
    onUpdateLecture({ ...lecture, tasks: updatedTasks });
  };

  // Task add
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskLabel.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      type: newTaskType,
      label: newTaskLabel.trim(),
      done: false,
      estimatedMinutes: newTaskMins
    };

    onUpdateLecture({
      ...lecture,
      tasks: [...lecture.tasks, newTask]
    });

    setNewTaskLabel('');
    setIsAddingTask(false);
  };

  // Task delete
  const handleDeleteTask = (taskId: string) => {
    onUpdateLecture({
      ...lecture,
      tasks: lecture.tasks.filter((tk) => tk.id !== taskId)
    });
  };

  // Add Link
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;

    const newLink = {
      id: `link-${Date.now()}`,
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`
    };

    onUpdateLecture({
      ...lecture,
      links: [...(lecture.links || []), newLink]
    });

    setNewLinkLabel('');
    setNewLinkUrl('');
    setIsAddingLink(false);
  };

  // Delete Link
  const handleDeleteLink = (linkId: string) => {
    onUpdateLecture({
      ...lecture,
      links: (lecture.links || []).filter((l) => l.id !== linkId)
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all overflow-hidden">
      {/* Lecture Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* High Yield Star Toggle */}
          <button
            onClick={handleToggleHighYield}
            className={`p-1.5 rounded-lg transition ${
              lecture.isHighYield
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
                : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'
            }`}
            title="Toggle High Yield status"
          >
            <Star className={`w-5 h-5 ${lecture.isHighYield ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {lecture.name}
              </h3>
              {lecture.isHighYield && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {t.highYieldBadge}
                </span>
              )}
            </div>

            {/* Lecture rollup summary */}
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>{stats.totalTopics} {t.bulkTitle.split(' ')[0]}</span>
              {stats.weakCount > 0 && (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  • {stats.weakCount} {t.weak}
                </span>
              )}
              {stats.tasksTotal > 0 && (
                <span>
                  • Tasks: {stats.tasksDone}/{stats.tasksTotal}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDeleteLecture}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
            title="Delete lecture"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-6">
          {/* Notes area */}
          {lecture.notes && (
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-400 mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>{t.notes}</span>
              </div>
              <p className="whitespace-pre-wrap">{lecture.notes}</p>
            </div>
          )}

          {/* Sub-Topics Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span>Sub-Topics ({lecture.topics.length})</span>
              </h4>

              <div className="flex items-center gap-2">
                {/* Bulk Paste Button */}
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.bulkAddTopics}</span>
                </button>
              </div>
            </div>

            {/* List of Sub-Topics */}
            <div className="space-y-2">
              {lecture.topics.map((topic) => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  lang={lang}
                  onUpdateMastery={(level) => handleTopicMasteryUpdate(topic.id, level)}
                  onEditTopicName={(newName) => handleEditTopicName(topic.id, newName)}
                  onDeleteTopic={() => handleDeleteTopic(topic.id)}
                />
              ))}

              {lecture.topics.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  No sub-topics added yet. Use single add or Bulk Paste above!
                </div>
              )}
            </div>

            {/* Single Add Topic Input Form */}
            <form onSubmit={handleAddSingleTopic} className="flex gap-2 pt-1">
              <input
                type="text"
                value={singleTopicName}
                onChange={(e) => setSingleTopicName(e.target.value)}
                placeholder={t.addTopic + '...'}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!singleTopicName.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t.addTopic}</span>
              </button>
            </form>
          </div>

          {/* Tasks & Checklist Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-teal-500" />
                <span>{t.tasks} ({stats.tasksDone}/{stats.tasksTotal})</span>
              </h4>

              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addTask}</span>
              </button>
            </div>

            {/* Add Task Form */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                    className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="quiz">{t.quiz}</option>
                    <option value="sheet">{t.sheet}</option>
                    <option value="past_exam">{t.pastExam}</option>
                    <option value="custom">{t.customTask}</option>
                  </select>

                  <input
                    type="text"
                    value={newTaskLabel}
                    onChange={(e) => setNewTaskLabel(e.target.value)}
                    placeholder="Task description (e.g. Past Exam Qs 2024)"
                    className="sm:col-span-2 p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Est. Mins:</span>
                    <input
                      type="number"
                      value={newTaskMins || ''}
                      onChange={(e) => setNewTaskMins(Number(e.target.value))}
                      className="w-16 p-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="20"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="px-3 py-1 rounded text-xs text-slate-500"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={!newTaskLabel.trim()}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold"
                    >
                      {t.addTask}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List of Tasks */}
            <div className="space-y-1.5">
              {lecture.tasks.map((tk) => (
                <div
                  key={tk.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={tk.done}
                      onChange={() => handleToggleTask(tk.id)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <span
                      className={`font-medium ${
                        tk.done
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {tk.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold">
                      {tk.type === 'quiz' ? t.quiz : tk.type === 'sheet' ? t.sheet : tk.type === 'past_exam' ? t.pastExam : t.customTask}
                    </span>
                  </label>

                  <div className="flex items-center gap-2 text-slate-400">
                    {tk.estimatedMinutes && (
                      <span className="text-[10px] text-slate-400">
                        {tk.estimatedMinutes} {t.estimatedMins}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteTask(tk.id)}
                      className="p-1 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links / Resources Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{t.lectureLinks}</span>
              </span>

              <button
                onClick={() => setIsAddingLink(!isAddingLink)}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + {t.addLink}
              </button>
            </div>

            {isAddingLink && (
              <form onSubmit={handleAddLink} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Link Title (e.g. YouTube Video / Drive Sheet)"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="url"
                  placeholder="URL (https://...)"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddingLink(false)} className="px-2 py-1 text-slate-500">
                    {t.cancel}
                  </button>
                  <button type="submit" className="px-3 py-1 bg-indigo-600 text-white font-bold rounded">
                    {t.save}
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {(lecture.links || []).map((lnk) => (
                <div key={lnk.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  <a href={lnk.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                    <span>{lnk.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button onClick={() => handleDeleteLink(lnk.id)} className="ml-1 text-indigo-400 hover:text-rose-500">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Topics Modal */}
      <BulkTopicModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        lang={lang}
        lectureName={lecture.name}
        onConfirmTopics={handleConfirmBulkTopics}
      />
    </div>
  );
};
