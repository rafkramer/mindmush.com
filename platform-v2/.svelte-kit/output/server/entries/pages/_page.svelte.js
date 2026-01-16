import { c as store_get, e as ensure_array_like, d as attr_class, g as stringify, f as attr, u as unsubscribe_stores } from "../../chunks/index2.js";
import "../../chunks/auth.js";
import { v as ventures } from "../../chunks/ventures.js";
import { s as studioExpenses } from "../../chunks/expenses.js";
import { g as getDateRange, f as formatDateRange, a as formatCurrency } from "../../chunks/format.js";
import { s as syncAllVentures } from "../../chunks/api.js";
import { t as toast } from "../../chunks/toast.js";
import { S as StatCard, C as Card } from "../../chunks/Card.js";
import { B as Button } from "../../chunks/Button.js";
import { B as Badge } from "../../chunks/Badge.js";
import { G as Gamepad_2, S as Smartphone, a as StateBadge } from "../../chunks/StateBadge.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { R as Refresh_cw, B as Building_2, T as Trending_up } from "../../chunks/trending-up.js";
import { D as Dollar_sign } from "../../chunks/dollar-sign.js";
import { W as Wallet } from "../../chunks/wallet.js";
import { _ as escape_html } from "../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let dateRange = 7;
    let syncing = false;
    let stats = (() => {
      const { start, end } = getDateRange(dateRange);
      let totalRevenue = 0;
      let totalExpenses = 0;
      let studioRevenue = 0;
      store_get($$store_subs ??= {}, "$ventures", ventures).forEach((v) => {
        const ventureExpenses = v.expenses.filter((e) => {
          const d = new Date(e.date);
          return d >= start && d <= end;
        }).reduce((sum, e) => sum + e.amount, 0);
        totalRevenue += v.revenue || 0;
        totalExpenses += ventureExpenses;
        studioRevenue += (v.revenue || 0) * (v.studioEquity / 100);
      });
      const studioExpenseTotal = store_get($$store_subs ??= {}, "$studioExpenses", studioExpenses).filter((e) => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      }).reduce((sum, e) => sum + e.amount, 0);
      totalExpenses += studioExpenseTotal;
      const studioProfit = studioRevenue - studioExpenseTotal;
      return { totalRevenue, studioRevenue, totalExpenses, studioProfit };
    })();
    let dateRangeDisplay = (() => {
      const { start, end } = getDateRange(dateRange);
      return formatDateRange(start, end);
    })();
    async function handleSync() {
      syncing = true;
      const result = await syncAllVentures();
      syncing = false;
      if (result.errors > 0) {
        toast.show(`Synced ${result.updated} ventures, ${result.errors} errors`, "error");
      } else if (result.updated > 0) {
        toast.show(`Synced ${result.updated} ventures successfully`, "success");
      } else {
        toast.show("No API-connected ventures to sync", "error");
      }
    }
    $$renderer2.push(`<div class="animate-fade-in"><div class="flex justify-between items-center mb-6 p-1.5 bg-white/[0.025] rounded-2xl border border-white/[0.05]"><div class="flex gap-1"><!--[-->`);
    const each_array = ensure_array_like([7, 30, "all"]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let range = each_array[$$index];
      $$renderer2.push(`<button${attr_class(`px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 ${stringify(dateRange === range ? "bg-indigo-500 text-white" : "text-white/45 hover:text-white hover:bg-white/5")}`)}>${escape_html(range === "all" ? "All Time" : `${range} Days`)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="px-4 text-xs text-white/45">${escape_html(dateRangeDisplay)}</div></div> <div class="flex justify-between items-start mb-7"><div><h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1> <p class="text-sm text-white/45 mt-1">Studio performance overview</p></div> `);
    Button($$renderer2, {
      variant: "secondary",
      onclick: handleSync,
      disabled: syncing,
      children: ($$renderer3) => {
        Refresh_cw($$renderer3, { size: 16, class: syncing ? "animate-spin" : "" });
        $$renderer3.push(`<!----> ${escape_html(syncing ? "Syncing..." : "Sync Data")}`);
      }
    });
    $$renderer2.push(`<!----></div> <div class="grid grid-cols-4 gap-4 mb-7">`);
    StatCard($$renderer2, {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: Dollar_sign,
      color: "purple"
    });
    $$renderer2.push(`<!----> `);
    StatCard($$renderer2, {
      label: "Studio Revenue",
      value: formatCurrency(stats.studioRevenue),
      icon: Building_2,
      color: "blue"
    });
    $$renderer2.push(`<!----> `);
    StatCard($$renderer2, {
      label: "Total Expenses",
      value: formatCurrency(stats.totalExpenses),
      icon: Wallet,
      color: "red"
    });
    $$renderer2.push(`<!----> `);
    StatCard($$renderer2, {
      label: "Studio Profit",
      value: formatCurrency(stats.studioProfit),
      icon: Trending_up,
      color: "green",
      valueClass: stats.studioProfit >= 0 ? "text-green-400" : "text-red-400"
    });
    $$renderer2.push(`<!----></div> `);
    Card($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="flex justify-between items-center px-6 py-5 border-b border-white/[0.05]"><h3 class="font-semibold">Portfolio</h3> <span class="text-xs text-white/45 bg-white/[0.035] px-2.5 py-1 rounded-full">${escape_html(store_get($$store_subs ??= {}, "$ventures", ventures).length)} ventures</span></div> <div class="overflow-x-auto"><table class="w-full"><thead><tr class="bg-black/20"><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Venture</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Type</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">State</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Revenue</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Expenses</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Profit</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Studio %</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Studio Rev</th></tr></thead><tbody>`);
        if (store_get($$store_subs ??= {}, "$ventures", ventures).length === 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<tr><td colspan="8" class="text-center py-12 text-white/45 text-sm">No ventures yet. Add your first venture to get started.</td></tr>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$ventures", ventures));
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let venture = each_array_1[$$index_1];
            const expenses = venture.expenses.reduce((sum, e) => sum + e.amount, 0);
            const profit = (venture.revenue || 0) - expenses;
            const studioRev = (venture.revenue || 0) * (venture.studioEquity / 100);
            $$renderer3.push(`<tr class="border-t border-white/[0.05] hover:bg-white/[0.02] cursor-pointer transition-colors"><td class="px-6 py-4"><div class="flex items-center gap-3"><div${attr_class(`w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden border ${stringify(!venture.icon ? "bg-gradient-to-br" : "")} ${stringify(venture.type === "game" && !venture.icon ? "from-amber-500/20 to-orange-500/25" : "")} ${stringify(venture.type === "app" && !venture.icon ? "from-blue-500/20 to-indigo-500/25" : "")} ${stringify(venture.type === "game" ? "border-amber-500/20" : "border-blue-500/20")}`)}>`);
            if (venture.icon) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<img${attr("src", venture.icon)}${attr("alt", venture.name)} class="w-full h-full object-cover"/>`);
            } else {
              $$renderer3.push("<!--[!-->");
              if (venture.type === "game") {
                $$renderer3.push("<!--[-->");
                Gamepad_2($$renderer3, { size: 16, class: "text-amber-300" });
              } else {
                $$renderer3.push("<!--[!-->");
                Smartphone($$renderer3, { size: 16, class: "text-blue-300" });
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]--></div> <span class="text-sm font-medium text-white">${escape_html(venture.name)}</span></div></td><td class="px-6 py-4">`);
            Badge($$renderer3, {
              variant: venture.type === "game" ? "orange" : "blue",
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->${escape_html(venture.type === "game" ? "Game" : "App")}`);
              }
            });
            $$renderer3.push(`<!----></td><td class="px-6 py-4">`);
            StateBadge($$renderer3, { state: venture.state });
            $$renderer3.push(`<!----></td><td class="px-6 py-4 text-sm font-mono">${escape_html(formatCurrency(venture.revenue || 0))}</td><td class="px-6 py-4 text-sm font-mono">${escape_html(formatCurrency(expenses))}</td><td${attr_class("px-6 py-4 text-sm font-mono", void 0, { "text-green-400": profit >= 0, "text-red-400": profit < 0 })}>${escape_html(formatCurrency(profit))}</td><td class="px-6 py-4 text-sm">${escape_html(venture.studioEquity)}%</td><td class="px-6 py-4 text-sm font-mono">${escape_html(formatCurrency(studioRev))}</td></tr>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></tbody></table></div>`);
      }
    });
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
