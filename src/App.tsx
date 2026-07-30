/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, ActiveTab, Subject, MasteryLevel } from './types';
import {
  loadInitialState,
  saveStateToLocalStorage,
  calculateGlobalStats
} from './utils/helpers';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { SubjectCurriculum } from './components/SubjectCurriculum';
import { WeakTopicsTriage } from './components/WeakTopicsTriage';
import { ExamCountdowns } from './components/ExamCountdowns';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { PrintReport } from './components/PrintReport';
import { ExportImportModal } from './components/ExportImportModal';
import { SearchModal } from './components/SearchModal';

export default function App() {
  const [appState, setAppState] = useState<AppState>(loadInitialState);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedSubjectIdForCurriculum, setSelectedSubjectIdForCurriculum] = useState<string | undefined>(undefined);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    saveStateToLocalStorage(appState);
  }, [appState]);

  // Apply Language & RTL / LTR direction
  useEffect(() => {
    document.documentElement.lang = appState.lang;
    document.documentElement.dir = appState.lang === 'ar' ? 'rtl' : 'ltr';
  }, [appState.lang]);

  // Apply Dark Mode class to <html> element
  useEffect(() => {
    if (appState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.theme]);

  // Helper to log user action to activity heatmap & streak
  const logActivityAction = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentLogs = { ...appState.activityLogs };
    currentLogs[todayStr] = (currentLogs[todayStr] || 0) + 1;

    let newStreak = appState.currentStreak;
    if (appState.lastActiveDate !== todayStr) {
      newStreak += 1;
    }

    setAppState((prev) => ({
      ...prev,
      activityLogs: currentLogs,
      currentStreak: newStreak,
      lastActiveDate: todayStr
    }));
  };

  // Language setter
  const handleSetLang = (lang: 'en' | 'ar') => {
    setAppState((prev) => ({ ...prev, lang }));
  };

  // Theme setter
  const handleSetTheme = (theme: 'light' | 'dark') => {
    setAppState((prev) => ({ ...prev, theme }));
  };

  // Subject Add
  const handleAddSubject = (name: string, color: string, examDate?: string) => {
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name,
      color,
      examDate,
      chapters: []
    };
    setAppState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSub]
    }));
    logActivityAction();
  };

  // Subject Update
  const handleUpdateSubject = (updatedSub: Subject) => {
    setAppState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === updatedSub.id ? updatedSub : s))
    }));
    logActivityAction();
  };

  // Subject Delete
  const handleDeleteSubject = (subjectId: string) => {
    setAppState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId)
    }));
  };

  // Direct Topic Mastery Update (from Triage, Dashboard or Curriculum)
  const handleUpdateTopicMastery = (
    subjectId: string,
    chapterId: string,
    lectureId: string,
    topicId: string,
    level: MasteryLevel
  ) => {
    setAppState((prev) => {
      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;

        const updatedChapters = sub.chapters.map((chap) => {
          if (chap.id !== chapterId) return chap;

          const updatedLectures = chap.lectures.map((lec) => {
            if (lec.id !== lectureId) return lec;

            const updatedTopics = lec.topics.map((top) => {
              if (top.id !== topicId) return top;
              return {
                ...top,
                masteryLevel: level,
                lastReviewed: new Date().toISOString()
              };
            });

            return {
              ...lec,
              topics: updatedTopics,
              lastReviewed: new Date().toISOString()
            };
          });

          return { ...chap, lectures: updatedLectures };
        });

        return { ...sub, chapters: updatedChapters };
      });

      return { ...prev, subjects: updatedSubjects };
    });

    logActivityAction();
  };

  // Export Data JSON File
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `medstudy_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Data Confirmation
  const handleConfirmImport = (importedState: AppState) => {
    setAppState(importedState);
  };

  // Print Summary Trigger
  const handlePrintSummary = () => {
    window.print();
  };

  // Jump to specific subject in curriculum
  const handleSelectSubjectForCurriculum = (subjectId: string) => {
    setSelectedSubjectIdForCurriculum(subjectId);
    setActiveTab('curriculum');
  };

  const globalStats = calculateGlobalStats(appState.subjects);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white font-sans">
      {/* Screen view for interactive app */}
      <div className="print:hidden">
        {/* Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={appState.lang}
          setLang={handleSetLang}
          theme={appState.theme}
          setTheme={handleSetTheme}
          onOpenSearch={() => setIsSearchOpen(true)}
          onExport={handleExportData}
          onImport={() => setIsImportOpen(true)}
          onPrint={handlePrintSummary}
          weakCount={globalStats.weakCount}
        />

        {/* Main View Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              subjects={appState.subjects}
              streak={appState.currentStreak}
              lang={appState.lang}
              setActiveTab={setActiveTab}
              onUpdateTopicMastery={handleUpdateTopicMastery}
              onSelectSubjectForCurriculum={handleSelectSubjectForCurriculum}
            />
          )}

          {activeTab === 'curriculum' && (
            <SubjectCurriculum
              subjects={appState.subjects}
              selectedSubjectId={selectedSubjectIdForCurriculum}
              lang={appState.lang}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {activeTab === 'triage' && (
            <WeakTopicsTriage
              subjects={appState.subjects}
              lang={appState.lang}
              onUpdateTopicMastery={handleUpdateTopicMastery}
              onPrint={handlePrintSummary}
            />
          )}

          {activeTab === 'exams' && (
            <ExamCountdowns
              subjects={appState.subjects}
              lang={appState.lang}
              onUpdateSubject={handleUpdateSubject}
              onSelectSubjectForCurriculum={handleSelectSubjectForCurriculum}
            />
          )}

          {activeTab === 'heatmap' && (
            <ActivityHeatmap
              activityLogs={appState.activityLogs}
              streak={appState.currentStreak}
              lang={appState.lang}
            />
          )}
        </main>

        {/* Footer */}
        <Footer lang={appState.lang} />
      </div>

      {/* Print View Layout for native browser print */}
      <PrintReport subjects={appState.subjects} lang={appState.lang} />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        subjects={appState.subjects}
        lang={appState.lang}
        onSelectResult={(subId, tab) => {
          setSelectedSubjectIdForCurriculum(subId);
          setActiveTab(tab);
        }}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        lang={appState.lang}
        onConfirmImport={handleConfirmImport}
      />
    </div>
  );
}
