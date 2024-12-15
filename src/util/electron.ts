export namespace Electron {
	export function isUsingElectron() {
		return "electron" in (window as any);
	}
}
