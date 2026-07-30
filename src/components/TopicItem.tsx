import React, { useState } from 'react';
import { Topic, MasteryLevel } from '../types';
import { translations } from '../translations';
import { formatRelativeTime } from '../utils/helpers';
import { Clock, Trash2, Edit2, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopicItemProps {
  topic: Topic;
  lang: 'en' | 'ar';
  onUpdateMastery: (level: MasteryLevel) => void;
  onEditTopicName: (newName: string) => void;
  onDeleteTopic: () => void;
}

export const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  lang,
  onUpdateMastery,
  onEditTopicName,
  onDeleteTopic
}) => {
  const t = translations[lang];
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(topic.name);

  const handleRatingChange = (level: MasteryLevel) => {
    // Trigger confetti if upgraded to excellent!
    if (level === 'excellent' && topic.masteryLevel !== 'excellent') {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
    onUpdateMastery(level);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onEditTopicName(nameInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      {/* Topic Name / Editing */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 text-xs font-medium px-2 py-1 rounded bg-white dark:bg-slate-800 border border-indigo-500 text-slate-900 dark:text-white focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button
              onClick={handleSaveName}
              className="p-1 rounded bg-emerald-600 text-white text-xs"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 rounded bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {topic.name}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
              title="Edit topic name"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={onDeleteTopic}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
              title="Delete topic"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Relative time reviewed */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          <Clock className="w-3 h-3" />
          <span>
            {t.lastReviewed}: {formatRelativeTime(topic.lastReviewed, lang)}
          </span>
        </div>
      </div>

      {/* Mastery Rating Pills */}
      <div className="flex items-center gap-1.5 self-start sm:self-center">
        {/* Weak Pill */}
        <button
          onClick={() => handleRatingChange('weak')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            topic.masteryLevel === 'weak'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/80'
          }`}
        >
          {t.weak}
        </button>

        {/* Good / Very Good Pill */}
        <button
          onClick={() => handleRatingChange('good')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            topic.masteryLevel === 'good'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/80'
          }`}
        >
          {t.good}
        </button>

        {/* Excellent Pill */}
        <button
          onClick={() => handleRatingChange('excellent')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            topic.masteryLevel === 'excellent'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80'
          }`}
        >
          {t.excellent}
        </button>
      </div>
    </div>
  );
};
