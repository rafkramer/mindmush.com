import { s as sanitize_props, a as spread_props, b as slot, c as store_get, d as attr_class, f as attr, u as unsubscribe_stores, g as stringify } from "../../../chunks/index2.js";
import { s as settings } from "../../../chunks/settings.js";
import { t as toast } from "../../../chunks/toast.js";
import { t as testApplovinApi } from "../../../chunks/api.js";
import { B as Button } from "../../../chunks/Button.js";
import "clsx";
import { I as Icon } from "../../../chunks/Icon.js";
import { L as Layout_grid } from "../../../chunks/layout-grid.js";
import { _ as escape_html } from "../../../chunks/context.js";
function Eye($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.460.1 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
      }
    ],
    ["circle", { "cx": "12", "cy": "12", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "eye" },
    $$sanitized_props,
    {
      /**
       * @component @name Eye
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMi4wNjIgMTIuMzQ4YTEgMSAwIDAgMSAwLS42OTYgMTAuNzUgMTAuNzUgMCAwIDEgMTkuODc2IDAgMSAxIDAgMCAxIDAgLjY5NiAxMC43NSAxMC43NSAwIDAgMS0xOS44NzYgMCIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/eye
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Layers($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.460.1 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "path",
      {
        "d": "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
      }
    ],
    [
      "path",
      { "d": "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" }
    ],
    [
      "path",
      { "d": "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "layers" },
    $$sanitized_props,
    {
      /**
       * @component @name Layers
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTIuODMgMi4xOGEyIDIgMCAwIDAtMS42NiAwTDIuNiA2LjA4YTEgMSAwIDAgMCAwIDEuODNsOC41OCAzLjkxYTIgMiAwIDAgMCAxLjY2IDBsOC41OC0zLjlhMSAxIDAgMCAwIDAtMS44M1oiIC8+CiAgPHBhdGggZD0ibTIyIDE3LjY1LTkuMTcgNC4xNmEyIDIgMCAwIDEtMS42NiAwTDIgMTcuNjUiIC8+CiAgPHBhdGggZD0ibTIyIDEyLjY1LTkuMTcgNC4xNmEyIDIgMCAwIDEtMS42NiAwTDIgMTIuNjUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/layers
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let apiKey = store_get($$store_subs ??= {}, "$settings", settings).applovinApiKey;
    let testing = false;
    let apiStatus = store_get($$store_subs ??= {}, "$settings", settings).applovinApiKey ? "connected" : "none";
    async function testConnection() {
      if (!apiKey) {
        toast.show("Please enter an API key first", "error");
        return;
      }
      testing = true;
      const result = await testApplovinApi(apiKey);
      testing = false;
      if (result.success) {
        apiStatus = "connected";
        toast.show("API connection successful", "success");
      } else {
        apiStatus = "error";
        toast.show(`API error: ${result.error}`, "error");
      }
    }
    function saveKey() {
      settings.update({ applovinApiKey: apiKey });
      toast.show("AppLovin API key saved", "success");
    }
    $$renderer2.push(`<div class="animate-fade-in"><div class="mb-7"><h1 class="text-2xl font-semibold tracking-tight">Settings</h1> <p class="text-sm text-white/45 mt-1">API Configuration</p></div> <div class="space-y-5"><div class="bg-white/[0.025] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-white/[0.08] transition-all"><div class="flex items-center gap-5 p-6 border-b border-white/[0.05]"><div class="w-14 h-14 rounded-xl bg-amber-500/12 flex items-center justify-center">`);
    Layers($$renderer2, { size: 28, class: "text-amber-400" });
    $$renderer2.push(`<!----></div> <div class="flex-1"><h3 class="text-lg font-semibold">AppLovin MAX</h3> <p class="text-sm text-white/45">Global API key for all mobile games. Revenue fetched by Bundle ID.</p></div> <div class="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl"><span${attr_class(`w-2 h-2 rounded-full ${stringify(apiStatus === "connected" ? "bg-green-400 shadow-lg shadow-green-400" : apiStatus === "error" ? "bg-red-400" : "bg-white/45")}`)}></span> <span${attr_class(`text-xs ${stringify(apiStatus === "connected" ? "text-green-400" : apiStatus === "error" ? "text-red-400" : "text-white/45")}`)}>${escape_html(apiStatus === "none" ? "Not configured" : apiStatus === "connected" ? "Connected" : "Connection failed")}</span></div></div> <div class="p-6"><div class="space-y-2 mb-5"><label class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider">Report Key</label> <div class="relative"><input${attr("type", "password")} class="w-full px-4 py-3.5 pr-12 bg-white/[0.035] border border-white/[0.05] rounded-xl text-white text-sm placeholder:text-white/45 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none" placeholder="Enter your AppLovin Report Key"${attr("value", apiKey)}/> <button class="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white transition-colors">`);
    {
      $$renderer2.push("<!--[!-->");
      Eye($$renderer2, { size: 18 });
    }
    $$renderer2.push(`<!--]--></button></div></div> <div class="flex gap-3">`);
    Button($$renderer2, {
      variant: "secondary",
      onclick: testConnection,
      disabled: testing,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(testing ? "Testing..." : "Test Connection")}`);
      }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      onclick: saveKey,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Save Key`);
      }
    });
    $$renderer2.push(`<!----></div></div></div> <div class="bg-white/[0.025] border border-white/[0.05] rounded-2xl overflow-hidden opacity-70"><div class="flex items-center gap-5 p-6 border-b border-white/[0.05]"><div class="w-14 h-14 rounded-xl bg-indigo-500/15 flex items-center justify-center">`);
    Layout_grid($$renderer2, { size: 28, class: "text-indigo-400" });
    $$renderer2.push(`<!----></div> <div class="flex-1"><h3 class="text-lg font-semibold">Superwall</h3> <p class="text-sm text-white/45">API keys configured per consumer app. Each app has its own key for proceeds tracking.</p></div></div> <div class="p-6"><p class="text-sm text-white/45 px-4 py-3 bg-white/[0.035] rounded-xl">Superwall API keys are set individually when creating or editing a consumer app venture.</p></div></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
