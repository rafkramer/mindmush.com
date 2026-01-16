<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
    hover?: boolean;
  }

  let { class: className = '', hover = true, children }: Props & { children?: any } = $props();
</script>

<div
  class={cn(
    'bg-white/[0.025] border border-white/[0.05] rounded-2xl overflow-hidden transition-all duration-200',
    hover && 'hover:border-white/[0.08]',
    className
  )}
>
  {@render children?.()}
</div>
