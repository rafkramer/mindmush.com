import { s as sanitize_props, a as spread_props, b as slot, c as store_get, u as unsubscribe_stores, d as attr_class, g as stringify, f as attr, h as attr_style, e as ensure_array_like } from "../../../../chunks/index2.js";
import { p as page, g as goto } from "../../../../chunks/index3.js";
import { v as ventures } from "../../../../chunks/ventures.js";
import { a as auth } from "../../../../chunks/auth.js";
import { s as settings } from "../../../../chunks/settings.js";
import { t as toast } from "../../../../chunks/toast.js";
import { a as formatCurrency, b as formatDate } from "../../../../chunks/format.js";
import { a as syncVenture } from "../../../../chunks/api.js";
import { S as StatCard, C as Card } from "../../../../chunks/Card.js";
import { B as Button } from "../../../../chunks/Button.js";
import { B as Badge } from "../../../../chunks/Badge.js";
import { G as Gamepad_2, S as Smartphone, a as StateBadge } from "../../../../chunks/StateBadge.js";
import { P as Plus, M as Modal, S as Select } from "../../../../chunks/Select.js";
import { I as Input } from "../../../../chunks/Input.js";
import { I as Icon } from "../../../../chunks/Icon.js";
import { R as Refresh_cw, T as Trending_up, B as Building_2 } from "../../../../chunks/trending-up.js";
import { S as Square_pen } from "../../../../chunks/square-pen.js";
import { D as Dollar_sign } from "../../../../chunks/dollar-sign.js";
import { W as Wallet } from "../../../../chunks/wallet.js";
import { T as Trash_2 } from "../../../../chunks/trash-2.js";
import { _ as escape_html } from "../../../../chunks/context.js";
function Arrow_left($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.460.1 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "m12 19-7-7 7-7" }],
    ["path", { "d": "M19 12H5" }]
  ];
  Icon($$renderer, spread_props([
    { name: "arrow-left" },
    $$sanitized_props,
    {
      /**
       * @component @name ArrowLeft
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTIgMTktNy03IDctNyIgLz4KICA8cGF0aCBkPSJNMTkgMTJINSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/arrow-left
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
    let syncing = false;
    let showEditModal = false;
    let showExpenseModal = false;
    let venture = ventures.get(page.params.id);
    let editForm = {};
    let newExpense = { description: "", amount: 0 };
    let ventureExpenses = venture?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0;
    let profit = (venture?.revenue || 0) - ventureExpenses;
    let studioRev = (venture?.revenue || 0) * ((venture?.studioEquity || 0) / 100);
    let apiStatus = (() => {
      if (!venture) return { status: "none", text: "" };
      if (venture.state === "building" || venture.state === "killed") {
        return {
          status: "disabled",
          text: `API sync disabled for ${venture.state} ventures`
        };
      }
      if (venture.type === "game") {
        if (venture.bundleId && store_get($$store_subs ??= {}, "$settings", settings).applovinApiKey) {
          return {
            status: "connected",
            text: `AppLovin API connected • Bundle: ${venture.bundleId}`
          };
        }
        if (!venture.bundleId) {
          return { status: "disconnected", text: "Bundle ID not configured" };
        }
        return {
          status: "disconnected",
          text: "AppLovin API key not configured in Settings"
        };
      }
      if (venture.superwallKey) {
        return { status: "connected", text: "Superwall API connected" };
      }
      return {
        status: "disconnected",
        text: "Superwall API key not configured"
      };
    })();
    let partners = (() => {
      if (!venture) return [];
      return venture.partners.map((p) => {
        const user = auth.getUser(p.userId);
        return { ...p, username: user?.username || "Unknown" };
      });
    })();
    const ventureStateOptions = [
      { value: "building", label: "Building" },
      { value: "live", label: "Live" },
      { value: "scaling", label: "Scaling" },
      { value: "passive", label: "Passive" },
      { value: "killed", label: "Killed" }
    ];
    const ventureTypeOptions = [
      { value: "app", label: "Consumer App" },
      { value: "game", label: "Mobile Game" }
    ];
    async function handleSync() {
      if (!venture) return;
      syncing = true;
      const result = await syncVenture(venture.id);
      syncing = false;
      if (result.success) {
        toast.show(`Revenue updated: ${formatCurrency(result.revenue || 0)}`, "success");
      } else {
        toast.show(result.error || "Sync failed", "error");
      }
    }
    function openEditModal() {
      if (!venture) return;
      editForm = { ...venture };
      showEditModal = true;
    }
    function saveVenture() {
      if (!venture || !editForm.name?.trim()) {
        toast.show("Please enter a venture name", "error");
        return;
      }
      ventures.update(venture.id, {
        name: editForm.name.trim(),
        type: editForm.type,
        state: editForm.state,
        revenue: editForm.revenue,
        studioEquity: Math.min(100, Math.max(0, editForm.studioEquity || 100)),
        bundleId: editForm.type === "game" ? editForm.bundleId : void 0,
        superwallKey: editForm.type === "app" ? editForm.superwallKey : void 0
      });
      toast.show("Venture updated successfully", "success");
      showEditModal = false;
    }
    function deleteVenture() {
      if (!venture || !confirm("Are you sure you want to delete this venture?")) return;
      ventures.delete(venture.id);
      toast.show("Venture deleted", "success");
      goto();
    }
    function addExpense() {
      if (!venture || !newExpense.description.trim() || newExpense.amount <= 0) {
        toast.show("Please fill in all fields", "error");
        return;
      }
      ventures.addExpense(venture.id, {
        description: newExpense.description.trim(),
        amount: newExpense.amount,
        date: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
      toast.show("Expense added", "success");
      showExpenseModal = false;
      newExpense = { description: "", amount: 0 };
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (venture) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="animate-fade-in"><div class="flex items-center gap-5 mb-6"><button class="w-11 h-11 rounded-xl bg-white/[0.025] border border-white/[0.05] flex items-center justify-center text-white/45 hover:bg-white/[0.04] hover:text-white transition-all">`);
        Arrow_left($$renderer3, { size: 20 });
        $$renderer3.push(`<!----></button> <div${attr_class(`w-16 h-16 rounded-2xl overflow-hidden border flex items-center justify-center shrink-0 ${stringify(!venture.icon ? "bg-gradient-to-br" : "bg-white/5")} ${stringify(venture.type === "game" && !venture.icon ? "from-amber-500/20 to-orange-500/25" : "")} ${stringify(venture.type === "app" && !venture.icon ? "from-blue-500/20 to-indigo-500/25" : "")} ${stringify(venture.type === "game" ? "border-amber-500/20" : "border-blue-500/20")} ${stringify(venture.icon ? "border-white/10" : "")}`)}>`);
        if (venture.icon) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<img${attr("src", venture.icon)}${attr("alt", venture.name)} class="w-full h-full object-cover"/>`);
        } else {
          $$renderer3.push("<!--[!-->");
          if (venture.type === "game") {
            $$renderer3.push("<!--[-->");
            Gamepad_2($$renderer3, { size: 28, class: "text-amber-300" });
          } else {
            $$renderer3.push("<!--[!-->");
            Smartphone($$renderer3, { size: 28, class: "text-blue-300" });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></div> <div class="flex-1"><div class="flex items-center gap-3 flex-wrap"><h1 class="text-2xl font-semibold">${escape_html(venture.name)}</h1> `);
        Badge($$renderer3, {
          variant: venture.type === "game" ? "orange" : "blue",
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(venture.type === "game" ? "Game" : "App")}`);
          }
        });
        $$renderer3.push(`<!----> `);
        StateBadge($$renderer3, { state: venture.state });
        $$renderer3.push(`<!----></div> <p class="text-sm text-white/45 mt-1">${escape_html(venture.type === "game" ? "Mobile Game" : "Consumer App")}</p></div> <div class="flex gap-2.5">`);
        Button($$renderer3, {
          variant: "secondary",
          onclick: handleSync,
          disabled: syncing,
          children: ($$renderer4) => {
            Refresh_cw($$renderer4, { size: 16, class: syncing ? "animate-spin" : "" });
            $$renderer4.push(`<!----> ${escape_html(syncing ? "Syncing..." : "Sync")}`);
          }
        });
        $$renderer3.push(`<!----> `);
        Button($$renderer3, {
          onclick: openEditModal,
          children: ($$renderer4) => {
            Square_pen($$renderer4, { size: 16 });
            $$renderer4.push(`<!----> Edit`);
          }
        });
        $$renderer3.push(`<!----></div></div> <div${attr_class(`px-5 py-4 rounded-xl mb-6 flex items-center gap-3 text-sm border ${stringify(apiStatus.status === "connected" ? "bg-green-500/10 border-green-500/20 text-green-400" : apiStatus.status === "disconnected" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-white/10 text-white/45")}`)}><span${attr_class(`w-2 h-2 rounded-full shrink-0 ${stringify(apiStatus.status === "connected" ? "bg-green-400 shadow-lg shadow-green-400" : apiStatus.status === "disconnected" ? "bg-red-400" : "bg-white/45")}`)}></span> ${escape_html(apiStatus.text)}</div> <div class="grid grid-cols-4 gap-4 mb-6">`);
        StatCard($$renderer3, {
          label: venture.type === "game" ? "Revenue" : "Proceeds",
          value: formatCurrency(venture.revenue || 0),
          icon: Dollar_sign,
          color: "purple"
        });
        $$renderer3.push(`<!----> `);
        StatCard($$renderer3, {
          label: "Expenses",
          value: formatCurrency(ventureExpenses),
          icon: Wallet,
          color: "red"
        });
        $$renderer3.push(`<!----> `);
        StatCard($$renderer3, {
          label: "Profit",
          value: formatCurrency(profit),
          icon: Trending_up,
          color: "green",
          valueClass: profit >= 0 ? "text-green-400" : "text-red-400"
        });
        $$renderer3.push(`<!----> `);
        StatCard($$renderer3, {
          label: "Studio Revenue",
          value: formatCurrency(studioRev),
          icon: Building_2,
          color: "blue"
        });
        $$renderer3.push(`<!----></div> <div class="grid grid-cols-2 gap-5">`);
        Card($$renderer3, {
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="px-6 py-5 border-b border-white/[0.05]"><h3 class="font-semibold">Partner Equity</h3></div> <div class="overflow-x-auto"><table class="w-full"><thead><tr class="bg-black/20"><th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Partner</th><th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Equity</th><th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Share of Profit</th></tr></thead><tbody><tr class="border-t border-white/[0.05]"><td class="px-6 py-3.5 text-sm font-medium">Studio (MINDMUSH)</td><td class="px-6 py-3.5"><div class="flex items-center gap-3"><div class="flex-1 h-1.5 bg-white/[0.035] rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"${attr_style(`width: ${stringify(venture.studioEquity)}%`)}></div></div> <span class="text-sm font-medium text-indigo-400">${escape_html(venture.studioEquity)}%</span></div></td><td class="px-6 py-3.5 text-sm font-mono">${escape_html(formatCurrency(profit * (venture.studioEquity / 100)))}</td></tr><!--[-->`);
            const each_array = ensure_array_like(partners);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let partner = each_array[$$index];
              $$renderer4.push(`<tr class="border-t border-white/[0.05]"><td class="px-6 py-3.5 text-sm">${escape_html(partner.username)}</td><td class="px-6 py-3.5"><div class="flex items-center gap-3"><div class="flex-1 h-1.5 bg-white/[0.035] rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"${attr_style(`width: ${stringify(partner.equity)}%`)}></div></div> <span class="text-sm font-medium text-indigo-400">${escape_html(partner.equity)}%</span></div></td><td class="px-6 py-3.5 text-sm font-mono">${escape_html(formatCurrency(profit * (partner.equity / 100)))}</td></tr>`);
            }
            $$renderer4.push(`<!--]--></tbody></table></div>`);
          }
        });
        $$renderer3.push(`<!----> `);
        Card($$renderer3, {
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex justify-between items-center px-6 py-5 border-b border-white/[0.05]"><h3 class="font-semibold">Venture Expenses</h3> `);
            Button($$renderer4, {
              variant: "secondary",
              size: "sm",
              onclick: () => showExpenseModal = true,
              children: ($$renderer5) => {
                Plus($$renderer5, { size: 14 });
                $$renderer5.push(`<!----> Add`);
              }
            });
            $$renderer4.push(`<!----></div> <div class="overflow-x-auto"><table class="w-full"><thead><tr class="bg-black/20"><th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Description</th><th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Amount</th><th class="text-left px-6 py-3 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Date</th><th class="px-6 py-3"></th></tr></thead><tbody>`);
            if (venture.expenses.length === 0) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<tr><td colspan="4" class="text-center py-8 text-white/45 text-sm">No expenses recorded.</td></tr>`);
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`<!--[-->`);
              const each_array_1 = ensure_array_like(venture.expenses);
              for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                let expense = each_array_1[$$index_1];
                $$renderer4.push(`<tr class="border-t border-white/[0.05] group hover:bg-white/[0.02]"><td class="px-6 py-3.5 text-sm">${escape_html(expense.description)}</td><td class="px-6 py-3.5 text-sm font-mono">${escape_html(formatCurrency(expense.amount))}</td><td class="px-6 py-3.5 text-sm text-white/45">${escape_html(formatDate(expense.date))}</td><td class="px-6 py-3.5"><button class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">`);
                Trash_2($$renderer4, { size: 14 });
                $$renderer4.push(`<!----></button></td></tr>`);
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]--></tbody></table></div>`);
          }
        });
        $$renderer3.push(`<!----></div></div> `);
        Modal($$renderer3, {
          title: "Edit Venture",
          size: "lg",
          onclose: () => showEditModal = false,
          get open() {
            return showEditModal;
          },
          set open($$value) {
            showEditModal = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="p-6 space-y-5">`);
            Input($$renderer4, {
              id: "editName",
              label: "Venture Name",
              get value() {
                return editForm.name;
              },
              set value($$value) {
                editForm.name = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> <div class="grid grid-cols-2 gap-4">`);
            Select($$renderer4, {
              id: "editType",
              label: "Type",
              options: ventureTypeOptions,
              get value() {
                return editForm.type;
              },
              set value($$value) {
                editForm.type = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            Select($$renderer4, {
              id: "editState",
              label: "State",
              options: ventureStateOptions,
              get value() {
                return editForm.state;
              },
              set value($$value) {
                editForm.state = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div> `);
            if (editForm.type === "game") {
              $$renderer4.push("<!--[-->");
              Input($$renderer4, {
                id: "editBundleId",
                label: "Bundle ID (for AppLovin)",
                placeholder: "com.studio.gamename",
                get value() {
                  return editForm.bundleId;
                },
                set value($$value) {
                  editForm.bundleId = $$value;
                  $$settled = false;
                }
              });
            } else {
              $$renderer4.push("<!--[!-->");
              Input($$renderer4, {
                id: "editSuperwallKey",
                label: "Superwall API Key",
                placeholder: "pk_...",
                get value() {
                  return editForm.superwallKey;
                },
                set value($$value) {
                  editForm.superwallKey = $$value;
                  $$settled = false;
                }
              });
            }
            $$renderer4.push(`<!--]--> <div class="grid grid-cols-2 gap-4">`);
            Input($$renderer4, {
              id: "editEquity",
              type: "number",
              label: "Studio Ownership (%)",
              min: 0,
              max: 100,
              get value() {
                return editForm.studioEquity;
              },
              set value($$value) {
                editForm.studioEquity = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            Input($$renderer4, {
              id: "editRevenue",
              type: "number",
              label: "Revenue ($)",
              min: 0,
              get value() {
                return editForm.revenue;
              },
              set value($$value) {
                editForm.revenue = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div></div> <div class="flex justify-between px-6 py-5 border-t border-white/[0.05] bg-black/20">`);
            Button($$renderer4, {
              variant: "danger",
              onclick: deleteVenture,
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Delete`);
              }
            });
            $$renderer4.push(`<!----> <div class="flex gap-3">`);
            Button($$renderer4, {
              variant: "ghost",
              onclick: () => showEditModal = false,
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Cancel`);
              }
            });
            $$renderer4.push(`<!----> `);
            Button($$renderer4, {
              onclick: saveVenture,
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Save`);
              }
            });
            $$renderer4.push(`<!----></div></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Modal($$renderer3, {
          title: "Add Venture Expense",
          onclose: () => showExpenseModal = false,
          get open() {
            return showExpenseModal;
          },
          set open($$value) {
            showExpenseModal = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="p-6 space-y-5">`);
            Input($$renderer4, {
              id: "expenseDesc",
              label: "Description",
              placeholder: "e.g., Marketing campaign",
              get value() {
                return newExpense.description;
              },
              set value($$value) {
                newExpense.description = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            Input($$renderer4, {
              id: "expenseAmount",
              type: "number",
              label: "Amount ($)",
              placeholder: "0",
              min: 0,
              get value() {
                return newExpense.amount;
              },
              set value($$value) {
                newExpense.amount = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div> <div class="flex justify-end gap-3 px-6 py-5 border-t border-white/[0.05] bg-black/20">`);
            Button($$renderer4, {
              variant: "ghost",
              onclick: () => showExpenseModal = false,
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Cancel`);
              }
            });
            $$renderer4.push(`<!----> `);
            Button($$renderer4, {
              onclick: addExpense,
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Add Expense`);
              }
            });
            $$renderer4.push(`<!----></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
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
