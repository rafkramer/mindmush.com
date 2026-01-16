import { s as sanitize_props, a as spread_props, b as slot, c as store_get, e as ensure_array_like, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { s as studioExpenses } from "../../../chunks/expenses.js";
import { t as toast } from "../../../chunks/toast.js";
import { a as formatCurrency, b as formatDate } from "../../../chunks/format.js";
import { S as StatCard, C as Card } from "../../../chunks/Card.js";
import { B as Button } from "../../../chunks/Button.js";
import { P as Plus, M as Modal, S as Select } from "../../../chunks/Select.js";
import { I as Input } from "../../../chunks/Input.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { W as Wallet } from "../../../chunks/wallet.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { T as Trash_2 } from "../../../chunks/trash-2.js";
import { _ as escape_html } from "../../../chunks/context.js";
function Calendar($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.460.1 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M8 2v4" }],
    ["path", { "d": "M16 2v4" }],
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "4", "rx": "2" }
    ],
    ["path", { "d": "M3 10h18" }]
  ];
  Icon($$renderer, spread_props([
    { name: "calendar" },
    $$sanitized_props,
    {
      /**
       * @component @name Calendar
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOCAydjQiIC8+CiAgPHBhdGggZD0iTTE2IDJ2NCIgLz4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjQiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0zIDEwaDE4IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/calendar
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
    let showAddModal = false;
    let newExpense = { description: "", category: "operations", amount: 0 };
    const categoryOptions = [
      { value: "operations", label: "Operations" },
      { value: "salaries", label: "Salaries" },
      { value: "tools", label: "Tools & Software" },
      { value: "marketing", label: "Marketing" },
      { value: "legal", label: "Legal" },
      { value: "other", label: "Other" }
    ];
    function addExpense() {
      if (!newExpense.description.trim() || newExpense.amount <= 0) {
        toast.show("Please fill in all fields", "error");
        return;
      }
      studioExpenses.add({
        description: newExpense.description.trim(),
        category: newExpense.category,
        amount: newExpense.amount,
        date: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
      toast.show("Studio cost added", "success");
      showAddModal = false;
      newExpense = { description: "", category: "operations", amount: 0 };
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="animate-fade-in"><div class="flex justify-between items-start mb-7"><div><h1 class="text-2xl font-semibold tracking-tight">Studio</h1> <p class="text-sm text-white/45 mt-1">Operating costs &amp; overhead</p></div> `);
      Button($$renderer3, {
        onclick: () => showAddModal = true,
        children: ($$renderer4) => {
          Plus($$renderer4, { size: 16 });
          $$renderer4.push(`<!----> Add Expense`);
        }
      });
      $$renderer3.push(`<!----></div> <div class="grid grid-cols-2 gap-4 mb-7">`);
      StatCard($$renderer3, {
        label: "Total Studio Costs",
        value: formatCurrency(store_get($$store_subs ??= {}, "$studioExpenses", studioExpenses).total),
        icon: Wallet,
        color: "red"
      });
      $$renderer3.push(`<!----> `);
      StatCard($$renderer3, {
        label: "This Month",
        value: formatCurrency(store_get($$store_subs ??= {}, "$studioExpenses", studioExpenses).thisMonth),
        icon: Calendar,
        color: "orange"
      });
      $$renderer3.push(`<!----></div> `);
      Card($$renderer3, {
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="px-6 py-5 border-b border-white/[0.05]"><h3 class="font-semibold">All Expenses</h3></div> <div class="overflow-x-auto"><table class="w-full"><thead><tr class="bg-black/20"><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Description</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Category</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Amount</th><th class="text-left px-6 py-3.5 text-[10px] font-semibold text-white/45 uppercase tracking-wider">Date</th><th class="px-6 py-3.5"></th></tr></thead><tbody>`);
          if (store_get($$store_subs ??= {}, "$studioExpenses", studioExpenses).length === 0) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<tr><td colspan="5" class="text-center py-12 text-white/45 text-sm">No studio expenses recorded.</td></tr>`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$studioExpenses", studioExpenses));
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let expense = each_array[$$index];
              $$renderer4.push(`<tr class="border-t border-white/[0.05] hover:bg-white/[0.02] group"><td class="px-6 py-4 text-sm">${escape_html(expense.description)}</td><td class="px-6 py-4">`);
              Badge($$renderer4, {
                children: ($$renderer5) => {
                  $$renderer5.push(`<!---->${escape_html(expense.category)}`);
                }
              });
              $$renderer4.push(`<!----></td><td class="px-6 py-4 text-sm font-mono">${escape_html(formatCurrency(expense.amount))}</td><td class="px-6 py-4 text-sm text-white/45">${escape_html(formatDate(expense.date))}</td><td class="px-6 py-4"><button class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">`);
              Trash_2($$renderer4, { size: 14 });
              $$renderer4.push(`<!----></button></td></tr>`);
            }
            $$renderer4.push(`<!--]-->`);
          }
          $$renderer4.push(`<!--]--></tbody></table></div>`);
        }
      });
      $$renderer3.push(`<!----></div> `);
      Modal($$renderer3, {
        title: "Add Studio Cost",
        onclose: () => showAddModal = false,
        get open() {
          return showAddModal;
        },
        set open($$value) {
          showAddModal = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="p-6 space-y-5">`);
          Input($$renderer4, {
            id: "description",
            label: "Description",
            placeholder: "e.g., Office rent",
            get value() {
              return newExpense.description;
            },
            set value($$value) {
              newExpense.description = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          Select($$renderer4, {
            id: "category",
            label: "Category",
            options: categoryOptions,
            get value() {
              return newExpense.category;
            },
            set value($$value) {
              newExpense.category = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          Input($$renderer4, {
            id: "amount",
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
            onclick: () => showAddModal = false,
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
