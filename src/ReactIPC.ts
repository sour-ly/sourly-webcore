// we are going to have to import this from the renderer process; it needs to follow some sort of IPC protocol only the top level can passdown.


const eWindow = window as Window & typeof globalThis & { electron: any };

export type Channels =
	| 'ipc-example'
	| 'storage-request'
	| 'storage-save'
	| 'open-link'
	| 'environment-request'
	| 'environment-response'
	| 'deeplink';

export type ChannelsMap = {
	[key in Channels]: any[];
};

type arg<T extends Channels> = ChannelsMap[T];

interface IPCHandler {
	on<T extends Channels>(channel: T, listener: (...args: arg<T>) => void): void;
	once<T extends Channels>(
		channel: T,
		listener: (...args: arg<T>) => void,
	): void;
	sendMessage<T extends Channels>(channel: T, ...args: arg<T>): void;
}

const IPC: IPCHandler = {
	on: (channel, listener) => {
		if (!eWindow.electron) {
			console.error('electron is not defined');
			return;
		}
		eWindow.electron.ipcRenderer.on(channel, listener as any);
	},
	once: (channel, listener) => {
		if (!eWindow.electron) {
			console.error('electron is not defined');
			return;
		}
		eWindow.electron.ipcRenderer.once(channel, listener as any);
	},
	sendMessage: (channel, ...args) => {
		if (!eWindow.electron) {
			console.error('electron is not defined');
			return;
		}
		eWindow.electron.ipcRenderer.sendMessage(channel, args);
	},
};

export default IPC;
