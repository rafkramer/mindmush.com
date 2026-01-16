import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface Settings {
  applovinApiKey: string;
}

const STORAGE_KEY = 'mindmush_settings';

function createSettingsStore() {
  const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
  const initial: Settings = stored ? JSON.parse(stored) : { applovinApiKey: '' };

  const settings = writable<Settings>(initial);

  settings.subscribe(value => {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  });

  return {
    subscribe: settings.subscribe,

    update: (updates: Partial<Settings>) => {
      settings.update(s => ({ ...s, ...updates }));
    },

    get: () => get(settings)
  };
}

export const settings = createSettingsStore();
