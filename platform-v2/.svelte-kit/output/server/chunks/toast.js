import { w as writable } from "./index.js";
function createToastStore() {
  const toasts = writable([]);
  return {
    subscribe: toasts.subscribe,
    show: (message, type = "success") => {
      const id = Date.now().toString(36);
      const toast2 = { id, message, type };
      toasts.update((t) => [...t, toast2]);
      setTimeout(() => {
        toasts.update((t) => t.filter((item) => item.id !== id));
      }, 3e3);
      return id;
    },
    success: (message) => {
      return createToastStore().show(message, "success");
    },
    error: (message) => {
      return createToastStore().show(message, "error");
    },
    remove: (id) => {
      toasts.update((t) => t.filter((item) => item.id !== id));
    }
  };
}
const toast = createToastStore();
export {
  toast as t
};
