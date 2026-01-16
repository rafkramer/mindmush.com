import { w as writable, g as get } from "./index.js";
function createSettingsStore() {
  const initial = { applovinApiKey: "" };
  const settings2 = writable(initial);
  settings2.subscribe((value) => {
  });
  return {
    subscribe: settings2.subscribe,
    update: (updates) => {
      settings2.update((s) => ({ ...s, ...updates }));
    },
    get: () => get(settings2)
  };
}
const settings = createSettingsStore();
export {
  settings as s
};
