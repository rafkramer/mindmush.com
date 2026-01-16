
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/(partner)" | "/" | "/(partner)/contract" | "/expenses" | "/login" | "/partners" | "/(partner)/payouts" | "/settings" | "/ventures" | "/ventures/[id]";
		RouteParams(): {
			"/ventures/[id]": { id: string }
		};
		LayoutParams(): {
			"/(partner)": Record<string, never>;
			"/": { id?: string };
			"/(partner)/contract": Record<string, never>;
			"/expenses": Record<string, never>;
			"/login": Record<string, never>;
			"/partners": Record<string, never>;
			"/(partner)/payouts": Record<string, never>;
			"/settings": Record<string, never>;
			"/ventures": { id?: string };
			"/ventures/[id]": { id: string }
		};
		Pathname(): "/" | "/contract" | "/contract/" | "/expenses" | "/expenses/" | "/login" | "/login/" | "/partners" | "/partners/" | "/payouts" | "/payouts/" | "/settings" | "/settings/" | "/ventures" | "/ventures/" | `/ventures/${string}` & {} | `/ventures/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}