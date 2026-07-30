import { Subject, Lecture, Topic, MasteryLevel, AppState } from '../types';
import { sampleSubjects, initialActivityLog } from '../sampleData';

const STORAGE_KEY = 'medstudy_diagnostic_state_v2';

export const loadInitialState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.subjects)) {
        return {
          subjects: parsed.subjects,
          activityLogs: parsed.activityLogs || {},
          currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
          lastActiveDate: parsed.lastActiveDate || '',
          theme: parsed.theme || 'light',
          lang: parsed.lang || 'en'
        };
      }
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }

  return {
    subjects: [],
    activityLogs: {},
    currentStreak: 0,
    lastActiveDate: '',
    theme: 'light',
    lang: 'en'
  };
};

export const saveStateToLocalStorage = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

/**
 * Bulk topic parsing engine
 * Handles:
 * 1. JSON Array e.g. ["Topic A", "Topic B"]
 * 2. Plain text with bullets:
 *    - Topic 1
 *    * Topic 2
 *    1. Topic 3
 *    a) Topic 4
 *    • Topic 5
 */
export const parseBulkTopicsInput = (rawInput: string): string[] => {
  if (!rawInput || !rawInput.trim()) return [];

  const trimmed = rawInput.trim();

  // Try JSON parsing first
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'string' ? item.trim() : typeof item === 'object' && item?.name ? String(item.name).trim() : ''))
          .filter(Boolean);
      }
    } catch {
      // Fall through to plain text parsing if JSON parsing fails
    }
  }

  // Plain text fallback line by line
  const lines = trimmed.split(/\r?\n/);
  const results: string[] = [];

  for (let line of lines) {
    // Strip leading bullets, numbers with dots/parens, asterisks, dashes, etc.
    let cleaned = line
      .replace(/^[\s\t]*[•\-*+>]+[\s\t]*/, '') // bullets, dashes, asterisks
      .replace(/^[\s\t]*\d+[\.\)]+[\s\t]*/, '') // 1. or 1)
      .replace(/^[\s\t]*[a-zA-Z][\.\)]+[\s\t]*/, '') // a. or a)
      .trim();

    if (cleaned.length > 0) {
      results.push(cleaned);
    }
  }

  return results;
};

// Relative time formatter for AR and EN
export const formatRelativeTime = (isoString?: string, lang: 'en' | 'ar' = 'en'): string => {
  if (!isoString) return lang === 'ar' ? 'لم تتم المراجع' : 'Not reviewed';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return lang === 'ar' ? 'غير معروف' : 'Unknown';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return lang === 'ar' ? 'اليوم' : 'Just now';
  } else if (diffHours < 24) {
    return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return lang === 'ar' ? 'الأمس' : 'Yesterday';
  } else if (diffDays < 30) {
    return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays} days ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return lang === 'ar' ? `منذ ${months} شهر` : `${months} mo ago`;
  }
};

// Rollup metrics helper
export interface RollupStats {
  totalTopics: number;
  weakCount: number;
  goodCount: number;
  excellentCount: number;
  unratedCount: number;
  masteryPercentage: number; // (% good or excellent out of rated or total)
  highYieldCount: number;
  tasksTotal: number;
  tasksDone: number;
}

export const calculateLectureStats = (lecture: Lecture): RollupStats => {
  const topics = lecture.topics || [];
  let weakCount = 0;
  let goodCount = 0;
  let excellentCount = 0;
  let unratedCount = 0;

  topics.forEach((t) => {
    if (t.masteryLevel === 'weak') weakCount++;
    else if (t.masteryLevel === 'good') goodCount++;
    else if (t.masteryLevel === 'excellent') excellentCount++;
    else unratedCount++;
  });

  const totalTopics = topics.length;
  const ratedCount = weakCount + goodCount + excellentCount;
  // Mastery percentage = (good + excellent) / totalTopics
  const masteryPercentage = totalTopics > 0 ? Math.round(((goodCount + excellentCount) / totalTopics) * 100) : 0;

  const tasksTotal = (lecture.tasks || []).length;
  const tasksDone = (lecture.tasks || []).filter((tk) => tk.done).length;

  return {
    totalTopics,
    weakCount,
    goodCount,
    excellentCount,
    unratedCount,
    masteryPercentage,
    highYieldCount: lecture.isHighYield ? 1 : 0,
    tasksTotal,
    tasksDone
  };
};

export const calculateSubjectStats = (subject: Subject): RollupStats => {
  let totalTopics = 0;
  let weakCount = 0;
  let goodCount = 0;
  let excellentCount = 0;
  let unratedCount = 0;
  let highYieldCount = 0;
  let tasksTotal = 0;
  let tasksDone = 0;

  (subject.chapters || []).forEach((chapter) => {
    (chapter.lectures || []).forEach((lecture) => {
      const lecStats = calculateLectureStats(lecture);
      totalTopics += lecStats.totalTopics;
      weakCount += lecStats.weakCount;
      goodCount += lecStats.goodCount;
      excellentCount += lecStats.excellentCount;
      unratedCount += lecStats.unratedCount;
      if (lecture.isHighYield) highYieldCount++;
      tasksTotal += lecStats.tasksTotal;
      tasksDone += lecStats.tasksDone;
    });
  });

  const masteryPercentage = totalTopics > 0 ? Math.round(((goodCount + excellentCount) / totalTopics) * 100) : 0;

  return {
    totalTopics,
    weakCount,
    goodCount,
    excellentCount,
    unratedCount,
    masteryPercentage,
    highYieldCount,
    tasksTotal,
    tasksDone
  };
};

export const calculateGlobalStats = (subjects: Subject[]) => {
  let totalTopics = 0;
  let weakCount = 0;
  let goodCount = 0;
  let excellentCount = 0;
  let unratedCount = 0;
  let tasksTotal = 0;
  let tasksDone = 0;

  subjects.forEach((sub) => {
    const stats = calculateSubjectStats(sub);
    totalTopics += stats.totalTopics;
    weakCount += stats.weakCount;
    goodCount += stats.goodCount;
    excellentCount += stats.excellentCount;
    unratedCount += stats.unratedCount;
    tasksTotal += stats.tasksTotal;
    tasksDone += stats.tasksDone;
  });

  const masteryPercentage = totalTopics > 0 ? Math.round(((goodCount + excellentCount) / totalTopics) * 100) : 0;
  const taskCompletionPercentage = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  return {
    totalTopics,
    weakCount,
    goodCount,
    excellentCount,
    unratedCount,
    masteryPercentage,
    tasksTotal,
    tasksDone,
    taskCompletionPercentage
  };
};

// Exam countdown helper
export const getDaysUntilExam = (examDateStr?: string): { days: number; status: 'today' | 'future' | 'passed' | 'none' } => {
  if (!examDateStr) return { days: 0, status: 'none' };

  const examDate = new Date(examDateStr);
  if (isNaN(examDate.getTime())) return { days: 0, status: 'none' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);

  const diffMs = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { days: 0, status: 'today' };
  if (diffDays < 0) return { days: Math.abs(diffDays), status: 'passed' };
  return { days: diffDays, status: 'future' };
};
