import React from 'react';
import { translations } from '../translations';
import { Github, Linkedin, Heart } from 'lucide-react';

interface FooterProps {
  lang: 'en' | 'ar';
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8 transition-colors print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{t.createdBy}</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/drahmedabdulrahman10-alt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <Github className="w-4 h-4" />
            <span>{t.github}</span>
          </a>

          <a
            href="https://www.linkedin.com/in/ahmed-abdulrahman-shaban-abdulrahman"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <Linkedin className="w-4 h-4" />
            <span>{t.linkedin}</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
