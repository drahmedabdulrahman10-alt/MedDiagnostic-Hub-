import React, { useState, useEffect } from 'react';
import { Subject, ActiveTab } from '../types';
import { translations } from '../translations';
import { Search, X, BookOpen, Star, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  lang: 'en' | 'ar';
  onSelectResult: (subjectId: string, tab: ActiveTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  subjects,
  lang,
  onSelectResult
}) => {
  const t = translations[lang];
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal via parent event if needed
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  interface SearchResultItem {
    type: 'subject' | 'chapter' | 'lecture' | 'topic';
    title: string;
    subtitle: string;
    subjectId: string;
    isHighYield?: boolean;
    mastery?: string;
  }

  const results: SearchResultItem[] = [];

  if (query.trim()) {
    const q = query.toLowerCase().trim();

    subjects.forEach((sub) => {
      if (sub.name.toLowerCase().includes(q)) {
        results.push({
          type: 'subject',
          title: sub.name,
          subtitle: 'Medical Subject',
          subjectId: sub.id
        });
      }

      sub.chapters.forEach((chap) => {
        if (chap.name.toLowerCase().includes(q)) {
          results.push({
            type: 'chapter',
            title: chap.name,
            subtitle: `Chapter under ${sub.name}`,
            subjectId: sub.id
          });
        }

        chap.lectures.forEach((lec) => {
          if (lec.name.toLowerCase().includes(q) || (lec.notes && lec.notes.toLowerCase().includes(q))) {
            results.push({
              type: 'lecture',
              title: lec.name,
              subtitle: `${sub.name} > ${chap.name}`,
              subjectId: sub.id,
              isHighYield: lec.isHighYield
            });
          }

          lec.topics.forEach((top) => {
            if (top.name.toLowerCase().includes(q)) {
              results.push({
                type: 'topic',
                title: top.name,
                subtitle: `${sub.name} > ${lec.name}`,
                subjectId: sub.id,
                mastery: top.masteryLevel,
                isHighYield: lec.isHighYield
              });
            }
          });
        });
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-indigo-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
          {results.map((res, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectResult(res.subjectId, 'curriculum');
                onClose();
              }}
              className="p-3 hover:bg-indigo-50/60 dark:hover:bg-slate-700/60 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {res.title}
                  </span>
                  {res.isHighYield && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      HY
                    </span>
                  )}
                  {res.mastery && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        res.mastery === 'weak'
                          ? 'bg-rose-100 text-rose-700'
                          : res.mastery === 'good'
                          ? 'bg-amber-100 text-amber-800'
                          : res.mastery === 'excellent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {res.mastery}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {res.subtitle}
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 rtl:rotate-180" />
            </div>
          ))}

          {query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              {t.searchNoResults}
            </div>
          )}

          {!query.trim() && (
            <div className="p-8 text-center text-xs text-slate-400">
              Type to search medical subjects, chapters, lectures, or sub-topics...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
