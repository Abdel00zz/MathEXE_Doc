
export interface Exercise {
  id: string;
  title: string;
  difficulty: number;
  content: string;
  keywords?: string[];
}

export interface Document {
  id:string;
  title: string;
  date: string;
  schoolYear: string;
  className: string;
  exercises: Exercise[];
  lastModified?: string;
}

export interface AppSettings {
  language: 'fr' | 'en';
  theme: 'light' | 'dark' | 'system';
  teacherName?: string;
  schoolId?: string;
  apiKey?: string;
  autoAnalyzeImages?: boolean;
}

export interface ExportOptions {
  columns: number;
  fontSize: number;
  theme: 'default' | 'ink-saver' | 'high-contrast';
  showDifficulty: boolean;
  showKeywords: boolean;
  showTitles: boolean;
}

export interface GeminiExerciseResponse {
  title: string;
  difficulty: number;
  keywords: string[];
  content: string;
}

export interface GeminiAnalysisOptions {
  boldKeywords: boolean;
  reviseText: boolean;
  suggestHints: boolean;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}