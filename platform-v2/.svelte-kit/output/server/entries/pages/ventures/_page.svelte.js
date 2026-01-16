import { c as store_get, d as attr_class, g as stringify, f as attr, u as unsubscribe_stores, e as ensure_array_like } from "../../../chunks/index2.js";
import { v as ventures } from "../../../chunks/ventures.js";
import { s as settings } from "../../../chunks/settings.js";
import { t as toast } from "../../../chunks/toast.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { a as formatCurrency } from "../../../chunks/format.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { G as Gamepad_2, S as Smartphone, a as StateBadge } from "../../../chunks/StateBadge.js";
import { _ as escape_html } from "../../../chunks/context.js";
import { B as Button } from "../../../chunks/Button.js";
import { P as Plus, M as Modal, S as Select } from "../../../chunks/Select.js";
import { I as Input } from "../../../chunks/Input.js";
function VentureCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { venture } = $$props;
    let ventureExpenses = venture.expenses.reduce((sum, e) => sum + e.amount, 0);
    let profit = (venture.revenue || 0) - ventureExpenses;
    let apiStatus = (() => {
      if (venture.state === "building" || venture.state === "killed") {
        return { status: "disabled", text: "API disabled" };
      }
      if (venture.type === "game") {
        if (venture.bundleId && store_get($$store_subs ??= {}, "$settings", settings).applovinApiKey) {
          return { status: "connected", text: "AppLovin" };
        }
        return { status: "disconnected", text: "Not configured" };
      }
      if (venture.superwallKey) {
        return { status: "connected", text: "Superwall" };
      }
      return { status: "disconnected", text: "Not configured" };
    })();
    $$renderer2.push(`<button class="relative w-full text-left bg-gradient-to-br from-white/[0.025] to-white/[0.015] border border-white/[0.05] rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-500/10 group"><div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div> <div class="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div> <div class="p-6"><div class="flex justify-between items-start mb-4"><div${attr_class(`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border ${stringify(!venture.icon ? "bg-gradient-to-br" : "bg-white/5")} ${stringify(venture.type === "game" && !venture.icon ? "from-amber-500/20 to-orange-500/25" : "")} ${stringify(venture.type === "app" && !venture.icon ? "from-blue-500/20 to-indigo-500/25" : "")} ${stringify(venture.type === "game" ? "border-amber-500/20" : "border-blue-500/20")} ${stringify(venture.icon ? "border-white/10" : "")}`)}>`);
    if (venture.icon) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<img${attr("src", venture.icon)}${attr("alt", venture.name)} class="w-full h-full object-cover"/>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (venture.type === "game") {
        $$renderer2.push("<!--[-->");
        Gamepad_2($$renderer2, { size: 24, class: "text-amber-300" });
      } else {
        $$renderer2.push("<!--[!-->");
        Smartphone($$renderer2, { size: 24, class: "text-blue-300" });
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex gap-1.5">`);
    Badge($$renderer2, {
      variant: venture.type === "game" ? "orange" : "blue",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(venture.type === "game" ? "Game" : "App")}`);
      }
    });
    $$renderer2.push(`<!----> `);
    StateBadge($$renderer2, { state: venture.state });
    $$renderer2.push(`<!----></div></div> <h3 class="text-lg font-semibold text-white mb-1">${escape_html(venture.name)}</h3> <p class="text-xs text-white/45 mb-1">${escape_html(venture.type === "game" ? "Mobile Game" : "Consumer App")}</p> <div${attr_class(`flex items-center gap-1.5 text-[11px] mt-2 ${stringify(apiStatus.status === "connected" ? "text-green-400" : apiStatus.status === "disconnected" ? "text-red-400" : "text-white/45")}`)}><span${attr_class(`w-1.5 h-1.5 rounded-full ${stringify(apiStatus.status === "connected" ? "bg-green-400 shadow-md shadow-green-400" : apiStatus.status === "disconnected" ? "bg-red-400" : "bg-white/45")}`)}></span> ${escape_html(apiStatus.text)}</div></div> <div class="grid grid-cols-2 border-t border-white/[0.05] bg-black/20"><div class="p-4 text-center border-r border-white/[0.05]"><div class="text-[10px] text-white/45 uppercase tracking-wider mb-1">${escape_html(venture.type === "game" ? "Revenue" : "Proceeds")}</div> <div class="font-mono text-xl font-semibold text-white">${escape_html(formatCurrency(venture.revenue || 0))}</div></div> <div class="p-4 text-center"><div class="text-[10px] text-white/45 uppercase tracking-wider mb-1">Profit</div> <div${attr_class("font-mono text-xl font-semibold", void 0, { "text-green-400": profit >= 0, "text-red-400": profit < 0 })}>${escape_html(formatCurrency(profit))}</div></div></div></button>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let stateFilter = "all";
    let showAddModal = false;
    let newVenture = {
      name: "",
      type: "app",
      state: "building",
      revenue: 0,
      studioEquity: 100,
      bundleId: "",
      superwallKey: "",
      icon: ""
    };
    let filteredVentures = store_get($$store_subs ??= {}, "$ventures", ventures);
    const stateOptions = [
      { value: "all", label: "All" },
      { value: "building", label: "Building" },
      { value: "live", label: "Live" },
      { value: "scaling", label: "Scaling" },
      { value: "passive", label: "Passive" },
      { value: "killed", label: "Killed" }
    ];
    const ventureStateOptions = [
      { value: "building", label: "Building (No API)" },
      { value: "live", label: "Live" },
      { value: "scaling", label: "Scaling" },
      { value: "passive", label: "Passive" },
      { value: "killed", label: "Killed (No API)" }
    ];
    function resetForm() {
      newVenture = {
        name: "",
        type: "app",
        state: "building",
        revenue: 0,
        studioEquity: 100,
        bundleId: "",
        superwallKey: "",
        icon: ""
      };
    }
    function addVenture() {
      if (!newVenture.name.trim()) {
        toast.show("Please enter a venture name", "error");
        return;
      }
      ventures.add({
        name: newVenture.name.trim(),
        type: newVenture.type,
        state: newVenture.state,
        revenue: newVenture.revenue,
        studioEquity: Math.min(100, Math.max(0, newVenture.studioEquity)),
        bundleId: newVenture.type === "game" ? newVenture.bundleId : void 0,
        superwallKey: newVenture.type === "app" ? newVenture.superwallKey : void 0,
        icon: newVenture.icon || void 0
      });
      toast.show("Venture added successfully", "success");
      showAddModal = false;
      resetForm();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="animate-fade-in"><div class="flex justify-between items-start mb-7"><div><h1 class="text-2xl font-semibold tracking-tight">Ventures</h1> <p class="text-sm text-white/45 mt-1">Manage your portfolio</p></div> `);
      Button($$renderer3, {
        onclick: () => showAddModal = true,
        children: ($$renderer4) => {
          Plus($$renderer4, { size: 16 });
          $$renderer4.push(`<!----> Add Venture`);
        }
      });
      $$renderer3.push(`<!----></div> <div class="flex gap-2 mb-6 flex-wrap"><!--[-->`);
      const each_array = ensure_array_like(stateOptions);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let option = each_array[$$index];
        const isActive = stateFilter === option.value;
        $$renderer3.push(`<button${attr_class(`px-4 py-2 text-xs font-medium rounded-full border transition-all duration-200 ${stringify(isActive ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-white/45 hover:border-white/20 hover:text-white")}`)}>${escape_html(option.label)}</button>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      if (filteredVentures.length === 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="text-center py-16 text-white/45"><p>No ventures found. Add your first venture to get started.</p></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"><!--[-->`);
        const each_array_1 = ensure_array_like(filteredVentures);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let venture = each_array_1[$$index_1];
          VentureCard($$renderer3, { venture });
        }
        $$renderer3.push(`<!--]--></div>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      Modal($$renderer3, {
        title: "Add New Venture",
        size: "lg",
        onclose: () => showAddModal = false,
        get open() {
          return showAddModal;
        },
        set open($$value) {
          showAddModal = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="p-6 space-y-5"><div class="flex gap-4"><div><label class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-2">Icon</label> <input type="file" accept="image/*" class="hidden" id="iconUpload"/> <label for="iconUpload" class="w-20 h-20 rounded-2xl bg-white/[0.035] border-2 border-dashed border-white/[0.05] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all">`);
          if (newVenture.icon) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<img${attr("src", newVenture.icon)} alt="Icon" class="w-full h-full object-cover rounded-2xl"/>`);
          } else {
            $$renderer4.push("<!--[!-->");
            Plus($$renderer4, { size: 20, class: "text-white/45" });
            $$renderer4.push(`<!----> <span class="text-[9px] text-white/45 uppercase tracking-wider">Upload</span>`);
          }
          $$renderer4.push(`<!--]--></label></div> <div class="flex-1">`);
          Input($$renderer4, {
            id: "ventureName",
            label: "Venture Name",
            placeholder: "Enter venture name",
            get value() {
              return newVenture.name;
            },
            set value($$value) {
              newVenture.name = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div> <div><label class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-2">Type</label> <div class="grid grid-cols-2 gap-3"><label class="cursor-pointer"><input type="radio"${attr("checked", newVenture.type === "app", true)} value="app" class="hidden"/> <div${attr_class(`flex flex-col items-center gap-2 p-5 rounded-xl border transition-all ${stringify(newVenture.type === "app" ? "bg-indigo-500/10 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-white/45")}`)}>`);
          Smartphone($$renderer4, {
            size: 24,
            class: newVenture.type === "app" ? "text-indigo-400" : ""
          });
          $$renderer4.push(`<!----> <span class="text-sm font-medium">Consumer App</span> <span${attr_class(`text-[10px] uppercase tracking-wider ${stringify(newVenture.type === "app" ? "text-indigo-400" : "")}`)}>Superwall</span></div></label> <label class="cursor-pointer"><input type="radio"${attr("checked", newVenture.type === "game", true)} value="game" class="hidden"/> <div${attr_class(`flex flex-col items-center gap-2 p-5 rounded-xl border transition-all ${stringify(newVenture.type === "game" ? "bg-indigo-500/10 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-white/45")}`)}>`);
          Gamepad_2($$renderer4, {
            size: 24,
            class: newVenture.type === "game" ? "text-indigo-400" : ""
          });
          $$renderer4.push(`<!----> <span class="text-sm font-medium">Mobile Game</span> <span${attr_class(`text-[10px] uppercase tracking-wider ${stringify(newVenture.type === "game" ? "text-indigo-400" : "")}`)}>AppLovin</span></div></label></div></div> <div class="grid grid-cols-2 gap-4">`);
          Select($$renderer4, {
            id: "ventureState",
            label: "State",
            options: ventureStateOptions,
            get value() {
              return newVenture.state;
            },
            set value($$value) {
              newVenture.state = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          Input($$renderer4, {
            id: "studioEquity",
            type: "number",
            label: "Studio Ownership (%)",
            placeholder: "100",
            min: 0,
            max: 100,
            get value() {
              return newVenture.studioEquity;
            },
            set value($$value) {
              newVenture.studioEquity = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          Input($$renderer4, {
            id: "revenue",
            type: "number",
            label: "Current Revenue ($)",
            placeholder: "0",
            min: 0,
            hint: "Enter existing revenue if migrating from another tracking system.",
            get value() {
              return newVenture.revenue;
            },
            set value($$value) {
              newVenture.revenue = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (newVenture.type === "game") {
            $$renderer4.push("<!--[-->");
            Input($$renderer4, {
              id: "bundleId",
              label: "Bundle ID",
              placeholder: "com.studio.gamename",
              hint: "Required for AppLovin revenue tracking. Must match exactly.",
              get value() {
                return newVenture.bundleId;
              },
              set value($$value) {
                newVenture.bundleId = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[!-->");
            Input($$renderer4, {
              id: "superwallKey",
              label: "Superwall API Key",
              placeholder: "pk_...",
              hint: "Required for proceeds tracking. Get this from Superwall dashboard.",
              get value() {
                return newVenture.superwallKey;
              },
              set value($$value) {
                newVenture.superwallKey = $$value;
                $$settled = false;
              }
            });
          }
          $$renderer4.push(`<!--]--></div> <div class="flex justify-end gap-3 px-6 py-5 border-t border-white/[0.05] bg-black/20">`);
          Button($$renderer4, {
            variant: "ghost",
            onclick: () => {
              showAddModal = false;
              resetForm();
            },
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->Cancel`);
            }
          });
          $$renderer4.push(`<!----> `);
          Button($$renderer4, {
            onclick: addVenture,
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->Add Venture`);
            }
          });
          $$renderer4.push(`<!----></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
