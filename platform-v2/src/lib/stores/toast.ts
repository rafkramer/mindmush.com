import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function createToastStore() {
  const toasts = writable<Toast[]>([]);

  return {
    subscribe: toasts.subscribe,

    show: (message: string, type: 'success' | 'error' = 'success') => {
      const id = Date.now().toString(36);
      const toast: Toast = { id, message, type };

      toasts.update(t => [...t, toast]);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        toasts.update(t => t.filter(item => item.id !== id));
      }, 3000);

      return id;
    },

    success: (message: string) => {
      return createToastStore().show(message, 'success');
    },

    error: (message: string) => {
      return createToastStore().show(message, 'error');
    },

    remove: (id: string) => {
      toasts.update(t => t.filter(item => item.id !== id));
    }
  };
}

export const toast = createToastStore();
