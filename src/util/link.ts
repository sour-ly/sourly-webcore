export namespace Link {

	const eWindow = window as Window & typeof globalThis & { electron?: any };

	export function NewTab(url: string) {
		if (eWindow.electron) {
			eWindow.electron.ipcRenderer.sendMessage('open-link', [url]);
		} else {
			eWindow.open(url);
		}
	}
}
