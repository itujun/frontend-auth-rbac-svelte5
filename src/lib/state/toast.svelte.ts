export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
	id: number;
	message: string;
	kind: ToastKind;
}

let items = $state<ToastItem[]>([]);
let idCounter = 0;

export const toastState = {
	get items() {
		return items;
	},
};

export function pushToast(message: string, kind: ToastKind = 'info'): void {
	const id = ++idCounter;
	items = [...items, { id, message, kind }];
	setTimeout(() => dismissToast(id), 4500);
}

export function dismissToast(id: number): void {
	items = items.filter((t) => t.id !== id);
}
