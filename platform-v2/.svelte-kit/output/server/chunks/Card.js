import { d as attr_class, j as clsx } from "./index2.js";
import { c as cn } from "./Button.js";
import { _ as escape_html } from "./context.js";
function StatCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      label,
      value,
      icon: Icon,
      color = "purple",
      valueClass = "",
      subtitle = ""
    } = $$props;
    const colors = {
      purple: "bg-gradient-to-br from-indigo-500/20 to-purple-500/15 text-indigo-300",
      green: "bg-gradient-to-br from-green-500/20 to-emerald-500/15 text-green-300",
      red: "bg-gradient-to-br from-red-500/20 to-rose-500/15 text-red-300",
      orange: "bg-gradient-to-br from-amber-500/20 to-orange-500/15 text-amber-300",
      blue: "bg-gradient-to-br from-blue-500/20 to-sky-500/15 text-blue-300"
    };
    $$renderer2.push(`<div class="relative bg-gradient-to-br from-white/[0.025] to-white/[0.015] border border-white/[0.05] rounded-2xl p-6 overflow-hidden transition-all duration-200 hover:border-white/[0.08] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 group"><div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div> <div class="flex items-start gap-4">`);
    if (Icon) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(clsx(cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", colors[color])))}><!---->`);
      Icon($$renderer2, { size: 22 });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex-1 min-w-0"><p class="text-xs font-medium text-white/45 uppercase tracking-wider mb-1.5">${escape_html(label)}</p> <p${attr_class(clsx(cn("font-mono text-2xl font-semibold tracking-tight", valueClass)))}>${escape_html(value)}</p> `);
    if (subtitle) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-[11px] text-white/45 mt-1">${escape_html(subtitle)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
function Card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { class: className = "", hover = true, children } = $$props;
    $$renderer2.push(`<div${attr_class(clsx(cn("bg-white/[0.025] border border-white/[0.05] rounded-2xl overflow-hidden transition-all duration-200", hover && "hover:border-white/[0.08]", className)))}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  Card as C,
  StatCard as S
};
