
export interface WordChallenge {
  word: string;
  definition: string;
  exampleSentence: string;
}

export interface HomophoneChallenge {
  sentence: string; // The sentence with a blank, e.g., "I went to _____ house."
  options: string[]; // ["their", "there"]
  correctWord: string; // "their"
  definition: string;
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  EXTREME = 'Extreme' // Added for Boss/Galaxy
}

export enum GameState {
  MENU = 'MENU',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT', // New state
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  SUMMARY = 'SUMMARY',
  ADVENTURE_MAP = 'ADVENTURE_MAP',
  WHEEL_SPIN = 'WHEEL_SPIN'
}

export type GameVariant = 
  | 'CLASSIC' 
  | 'HOMOPHONE' 
  | 'SPEED' 
  | 'MISSING_LETTER' 
  | 'SCRAMBLE' 
  | 'SENTENCE_SPELL' 
  | 'WHISPER' 
  | 'ADVENTURE' 
  | 'BOSS' 
  | 'DAILY' 
  | 'MULTIPLAYER' 
  | 'WHEEL' 
  | 'SILENT_LETTER' 
  | 'REVERSE' 
  | 'MEMORY';

export interface AdventureLevel {
  id: string;
  name: string;
  difficulty: Difficulty;
  isUnlocked: boolean;
  isCompleted: boolean;
  theme: string; // 'forest', 'desert', 'mountain', 'galaxy'
}

export interface AudioVisualizerProps {
  stream?: MediaStream;
  analyser?: AnalyserNode;
  isListening?: boolean;
}

export interface ScoreData {
  correct: number;
  total: number;
  history: {
    word: string;
    userSpelling: string;
    isCorrect: boolean;
  }[];
}

export type Theme = 'light' | 'dark' | 'system';
export type VibrationIntensity = 'off' | 'light' | 'medium' | 'heavy';

export interface AppSettings {
  theme: Theme;
  ttsVolume: number; // 0.0 to 1.0
  sfxVolume: number; // 0.0 to 1.0
  vibration: VibrationIntensity;
  voiceAccent: 'US' | 'GB'; // New Accent Setting
  isOfflineMode: boolean; // New Offline Toggle
}
