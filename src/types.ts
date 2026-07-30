export type MasteryLevel = 'unrated' | 'weak' | 'good' | 'excellent';

export type TaskType = 'quiz' | 'sheet' | 'past_exam' | 'custom';

export interface Task {
  id: string;
  type: TaskType;
  customLabel?: string;
  label: string;
  done: boolean;
  dateCompleted?: string;
  estimatedMinutes?: number;
}

export interface Topic {
  id: string;
  name: string;
  masteryLevel: MasteryLevel;
  notes?: string;
  lastReviewed?: string;
}

export interface LectureLink {
  id: string;
  label: string;
  url: string;
}

export interface Lecture {
  id: string;
  name: string;
  notes?: string;
  links?: LectureLink[];
  isHighYield: boolean;
  dateFirstStudied?: string;
  lastReviewed?: string;
  tasks: Task[];
  topics: Topic[];
}

export interface Chapter {
  id: string;
  name: string;
  lectures: Lecture[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  examDate?: string; // YYYY-MM-DD
  chapters: Chapter[];
}

export interface DailyActivityLog {
  [dateStr: string]: number; // "YYYY-MM-DD": count
}

export interface AppState {
  subjects: Subject[];
  activityLogs: DailyActivityLog;
  currentStreak: number;
  lastActiveDate?: string;
  theme: 'light' | 'dark';
  lang: 'en' | 'ar';
}

export type ActiveTab = 'dashboard' | 'curriculum' | 'triage' | 'exams' | 'heatmap';
