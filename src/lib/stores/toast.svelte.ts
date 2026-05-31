type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
	id: string;
	message: string;
	type: ToastType;
}

let toasts = $state<Toast[]>([]);

export function useToast() {
	function add(message: string, type: ToastType = 'info', duration = 4000) {
		const id = crypto.randomUUID();
		toasts = [...toasts, { id, message, type }];
		setTimeout(() => remove(id), duration);
	}

	function remove(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}

	return {
		get all() { return toasts; },
		add,
		remove,
		success: (msg: string) => add(msg, 'success'),
		error: (msg: string) => add(msg, 'error'),
		info: (msg: string) => add(msg, 'info'),
		warning: (msg: string) => add(msg, 'warning')
	};
}
