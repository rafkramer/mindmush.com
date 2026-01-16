import { f as attr, d as attr_class, j as clsx, k as bind_props } from "./index2.js";
import { c as cn } from "./Button.js";
import { _ as escape_html } from "./context.js";
function Input($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      type = "text",
      value = "",
      placeholder = "",
      label = "",
      hint = "",
      required = false,
      readonly = false,
      disabled = false,
      class: className = "",
      id = "",
      min,
      max,
      oninput
    } = $$props;
    $$renderer2.push(`<div class="space-y-2">`);
    if (label) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<label${attr("for", id)} class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider">${escape_html(label)}</label>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <input${attr("type", type)}${attr("id", id)}${attr("placeholder", placeholder)}${attr("required", required, true)}${attr("readonly", readonly, true)}${attr("disabled", disabled, true)}${attr("min", min)}${attr("max", max)}${attr("value", value)}${attr_class(clsx(cn("w-full px-4 py-3.5 bg-white/[0.035] border border-white/[0.05] rounded-xl text-white text-sm", "placeholder:text-white/45 transition-all duration-200", "hover:border-white/[0.08]", "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:bg-white/[0.06]", "disabled:opacity-50 disabled:cursor-not-allowed", "read-only:opacity-70", className)))}/> `);
    if (hint) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-[11px] text-white/45">${escape_html(hint)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value });
  });
}
export {
  Input as I
};
