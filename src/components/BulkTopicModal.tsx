import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { parseBulkTopicsInput } from '../utils/helpers';
import { X, Sparkles, Check, FileText } from 'lucide-react';

interface BulkTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  onConfirmTopics: (topics: string[]) => void;
  lectureName: string;
}

export const BulkTopicModal: React.FC<BulkTopicModalProps> = ({
  isOpen,
  onClose,
  lang,
  onConfirmTopics,
  lectureName
}) => {
  const t = translations[lang];
  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<{ id: string; text: string; selected: boolean }[]>([]);

  useEffect(() => {
    if (rawText) {
      const extracted = parseBulkTopicsInput(rawText);
      setParsedItems(
        extracted.map((item, idx) => ({
          id: `item-${idx}-${item}`,
          text: item,
          selected: true
        }))
      );
    } else {
      setParsedItems([]);
    }
  }, [rawText]);

  if (!isOpen) return null;

  const toggleItemSelection = (id: string) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleConfirm = () => {
    const finalTopics = parsedItems.filter((i) => i.selected).map((i) => i.text);
    if (finalTopics.length > 0) {
      onConfirmTopics(finalTopics);
      setRawText('');
      onClose();
    }
  };

  const selectedCount = parsedItems.filter((i) => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.bulkTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lectureName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {t.bulkSubtitle}
          </p>

          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={t.bulkPlaceholder}
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
          />

          {/* Live Detected Preview Checklist */}
          {parsedItems.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  {t.previewDetected} ({selectedCount}/{parsedItems.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setParsedItems((prev) =>
                      prev.map((i) => ({ ...i, selected: !parsedItems.every((x) => x.selected) }))
                    )
                  }
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {parsedItems.every((x) => x.selected) ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700/80 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-1">
                {parsedItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 p-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className={item.selected ? 'font-medium' : 'line-through opacity-50'}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {rawText.trim() && parsedItems.length === 0 && (
            <p className="text-xs text-rose-500 font-medium">
              {t.noTopicsParsed}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            {t.cancel}
          </button>

          <button
            disabled={selectedCount === 0}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{t.confirmAddTopics} ({selectedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
