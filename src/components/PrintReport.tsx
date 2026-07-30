import React from 'react';
import { Subject } from '../types';
import { translations } from '../translations';
import { Star } from 'lucide-react';

interface PrintReportProps {
  subjects: Subject[];
  lang: 'en' | 'ar';
}

export const PrintReport: React.FC<PrintReportProps> = ({ subjects, lang }) => {
  const t = translations[lang];

  interface PrintItem {
    subjectName: string;
    lectureName: string;
    isHighYield: boolean;
    topicName: string;
  }

  // Gather weak topics
  const groupedData: { [subName: string]: { [lecName: string]: { topicName: string; isHighYield: boolean }[] } } = {};

  subjects.forEach((sub) => {
    sub.chapters.forEach((chap) => {
      chap.lectures.forEach((lec) => {
        lec.topics.forEach((top) => {
          if (top.masteryLevel === 'weak') {
            if (!groupedData[sub.name]) groupedData[sub.name] = {};
            if (!groupedData[sub.name][lec.name]) groupedData[sub.name][lec.name] = [];
            groupedData[sub.name][lec.name].push({
              topicName: top.name,
              isHighYield: lec.isHighYield
            });
          }
        });
      });
    });
  });

  const todayStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="hidden print:block print:p-8 bg-white text-black text-xs space-y-6">
      {/* Print Header */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            {t.printTitle}
          </h1>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            {t.printSubtitle}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-600">{t.generatedOn}: {todayStr}</p>
        </div>
      </div>

      {/* Topics Content */}
      {Object.keys(groupedData).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedData).map(([subName, lectures]) => (
            <div key={subName} className="space-y-3">
              <h2 className="text-base font-extrabold uppercase border-b border-slate-400 pb-1 text-slate-900">
                Subject: {subName}
              </h2>

              <div className="space-y-3 pl-3">
                {Object.entries(lectures).map(([lecName, topics]) => (
                  <div key={lecName} className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>• Lecture: {lecName}</span>
                      {topics[0]?.isHighYield && (
                        <span className="font-extrabold text-amber-700">
                          [HIGH YIELD]
                        </span>
                      )}
                    </h3>

                    <ul className="list-disc pl-6 space-y-1 text-slate-900">
                      {topics.map((tItem, idx) => (
                        <li key={idx} className="font-medium">
                          {tItem.topicName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm font-bold text-slate-700 py-8 text-center">
          No weak topics recorded! All topics are marked as Good or Excellent.
        </p>
      )}

      {/* Print Footer */}
      <div className="border-t border-slate-300 pt-4 text-center text-[10px] text-slate-500">
        Generated via MedStudy Diagnostic Tracker • Dr. Ahmed Abdulrahman
      </div>
    </div>
  );
};
