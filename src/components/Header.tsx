import React from 'react';
import { ActiveTab } from '../types';
import { translations } from '../translations';
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  Download,
  Moon,
  Printer,
  Search,
  Sparkles,
  Sun,
  Upload,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onOpenSearch: () => void;
  onExport: () => void;
  onImport: () => void;
  onPrint: () => void;
  weakCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  theme,
  setTheme,
  onOpenSearch,
  onExport,
  onImport,
  onPrint,
  weakCount
}) => {
  const t = translations[lang];

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: t.dashboard, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'curriculum', label: t.curriculum, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'triage', label: t.triage, icon: <AlertTriangle className="w-4 h-4" />, badge: weakCount },
    { id: 'exams', label: t.exams, icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'heatmap', label: t.heatmap, icon: <Activity className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                MedDiagnostic <span className="text-indigo-600 dark:text-indigo-400">Hub</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  v1.2
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 hidden sm:block font-medium">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-2 transition"
              title={t.searchPlaceholder}
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">{t.searchPlaceholder}</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Print Weak Summary */}
            <button
              onClick={onPrint}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-1.5 transition"
              title={t.printSummary}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden lg:inline">{t.printSummary}</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={onExport}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
              title={t.exportData}
            >
              <Download className="w-4 h-4" />
              <span className="hidden xl:inline">{t.exportData}</span>
            </button>

            {/* Import JSON */}
            <button
              onClick={onImport}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
              title={t.importData}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden xl:inline">{t.importData}</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition ${
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition ${
                  lang === 'ar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                عربي
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'light' ? t.darkMode : t.lightMode}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pb-1 border-t border-slate-100 dark:border-slate-800/60 pt-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none dark:bg-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-rose-600' : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
