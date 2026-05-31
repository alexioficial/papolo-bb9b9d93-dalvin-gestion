import { browser } from '$app/environment';

function getInitialTheme(): boolean {
	if (!browser) return false;
	const stored = localStorage.getItem('theme');
	if (stored === 'dark') return true;
	if (stored === 'light') return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

let currentTheme = $state(getInitialTheme());

if (browser) {
	applyTheme(currentTheme);
}

function applyTheme(dark: boolean): void {
	if (dark) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

export function useTheme() {
	function toggle() {
		currentTheme = !currentTheme;
		applyTheme(currentTheme);
		if (browser) {
			localStorage.setItem('theme', currentTheme ? 'dark' : 'light');
		}
	}

	function setTheme(dark: boolean) {
		currentTheme = dark;
		applyTheme(dark);
		if (browser) {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		}
	}

	return {
		get isDark() { return currentTheme; },
		toggle,
		setTheme
	};
}
