import { d as attr_class, j as clsx } from "./index2.js";
import { c as cn } from "./Button.js";
function Badge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { variant = "default", class: className = "", children } = $$props;
    const variants = {
      default: "bg-white/[0.035] text-white/75",
      purple: "bg-indigo-500/15 text-indigo-400",
      green: "bg-green-500/12 text-green-400",
      orange: "bg-amber-500/12 text-amber-400",
      blue: "bg-blue-500/15 text-blue-400",
      red: "bg-red-500/12 text-red-400"
    };
    $$renderer2.push(`<span${attr_class(clsx(cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider", variants[variant], className)))}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></span>`);
  });
}
export {
  Badge as B
};
