import { STORAGE_KEYS } from './constants';
import type { User, Venture, StudioExpense, Settings, Payout, Document, Idea } from './types';

// Default admin user - change password after first login
const DEFAULT_USERS: User[] = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin', contract: '' },
];

// Data version - increment to force data reset
const DATA_VERSION = '9';

export function initializeData(): void {
  const currentVersion = localStorage.getItem('mindmush_data_version');
  const needsInit = currentVersion !== DATA_VERSION;

  if (needsInit) {
    // Clean slate - reset everything
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.ventures, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.studioExpenses, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.payouts, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ideas, JSON.stringify([]));
    localStorage.setItem('mindmush_data_version', DATA_VERSION);
  }
}

// Force reset all data to clean state
export function resetAllData(): void {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(DEFAULT_USERS));
  localStorage.setItem(STORAGE_KEYS.ventures, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.studioExpenses, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({}));
  localStorage.setItem(STORAGE_KEYS.payouts, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ideas, JSON.stringify([]));
  localStorage.setItem('mindmush_data_version', DATA_VERSION);
}

// Users
export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

// Ventures
export function getVentures(): Venture[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ventures) || '[]');
}

export function saveVentures(ventures: Venture[]): void {
  localStorage.setItem(STORAGE_KEYS.ventures, JSON.stringify(ventures));
}

// Studio Expenses
export function getStudioExpenses(): StudioExpense[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.studioExpenses) || '[]');
}

export function saveStudioExpenses(expenses: StudioExpense[]): void {
  localStorage.setItem(STORAGE_KEYS.studioExpenses, JSON.stringify(expenses));
}

// Settings
export function getSettings(): Settings {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}');
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

// Payouts
export function getPayouts(): Payout[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.payouts) || '[]');
}

export function savePayouts(payouts: Payout[]): void {
  localStorage.setItem(STORAGE_KEYS.payouts, JSON.stringify(payouts));
}

// Documents
export function getDocuments(): Document[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.documents) || '[]');
}

export function saveDocuments(documents: Document[]): void {
  localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(documents));
}

// Current User (session)
export function getCurrentUser(): User | null {
  const saved = sessionStorage.getItem(STORAGE_KEYS.currentUser);
  return saved ? JSON.parse(saved) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

// Ideas
export function getIdeas(): Idea[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ideas) || '[]');
}

export function saveIdeas(ideas: Idea[]): void {
  localStorage.setItem(STORAGE_KEYS.ideas, JSON.stringify(ideas));
}

// Generate unique ID
export function generateId(): string {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Image compression utility
export function compressImage(file: File, maxWidth = 400, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
