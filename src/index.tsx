import App from './App';
import { createWaitFunction } from './util/promise';
import { Profile, ProfileProps } from './object/Profile';
import SettingsObject, { Settings } from './settings/settings';
import { IStorage } from './interface/istorage';
import IAsset from './interface/iasset';
import IAPI from './interface/iapi';

type EnvironmentVariables = {
	version: string;
	mode: 'production' | 'development';
	debug: boolean;
	platform: string;
	endpoint?: string;
};

export let environment: EnvironmentVariables = {
	version: '-0.0.0',
	mode: 'production',
	debug: false,
	platform: 'win32',
	endpoint: 'https://api.sourly.io',
};

export var profileobj: Profile;
export var sourlysettings: Settings;
export var storage: IStorage;
export var endpoint: string;
export var assets: IAsset = {
	getAsset: (asset: string) => '',
};
export var api: IAPI = {
	endpoint: 'https://api.sourly.org',
}

export function setProfile(p: Profile) {
	profileobj = p;
}


export enum SourlyFlags {
	NULL = 0x00,
	NEW_PROFILE = 0x01,
	NO_SKILLS = 0x02,
	SEEN_WELCOME = 0x04,
	IGNORE = 0x08,
}

//this is going to be the main entry point for the app, this is really important in how the app is going to be structured regardless of the platform; this will allow us to interface with the main process and the renderer process
interface AppProps {
	getProfile: () => Promise<ProfileProps>;
	getSettings: () => Promise<Settings>;
	getFlags: () => Promise<number>;
	setFlags: (flags: number) => Promise<void>;
	systems: {
		storage: IStorage;
		asset: IAsset;
		api: IAPI;
	}
}
async function AppInit({ getProfile, getSettings, getFlags, setFlags, systems }: AppProps) {
	return await createWaitFunction(
		new Promise(async (resolve) => {
			storage = systems.storage;
			assets = systems.asset;
			api = systems.api;
			sourlysettings = new SettingsObject(await getSettings());
			profileobj = new Profile();
			resolve(null);
		}),
		async () => {
			if (!environment) {
				// Handle the case where environment might not be ready
				throw new Error('Environment is not initialized');
			}
			if (!assets) {
				throw new Error('Assets are not initialized');
			}
			if (!api) {
				throw new Error('API is not initialized');
			}
			return App;
		},
	);
}

export default AppInit;
