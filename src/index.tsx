import App from './App';
import { createWaitFunction } from './util/promise';
import { Profile, ProfileProps } from './object/Profile';
import SettingsObject, { Settings } from './settings/settings';
import { IStorage } from './interface/istorage';
import IAsset from './interface/iasset';
import IAPI from './interface/iapi';
import IFlags from './interface/iflag';
import IEnvironment from './interface/ienvironment';

export var environment: IEnvironment = {
	version: '0.1.0',
	mode: 'development',
	platform: 'web',
};
export var profileobj: Profile;
export var sourlysettings: Settings;
export var storage: IStorage;
export var endpoint: string;
export var flags: IFlags = {
	getFlags: () => 0,
	setFlags: (flags: number) => 0,
	xor: (flag: number) => flags,
	or: (flag: number) => flags,
	and: (flag: number) => flags,
	not: () => flags,
};
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
	SEEN_MIGRATION = 0x10,
}

//this is going to be the main entry point for the app, this is really important in how the app is going to be structured regardless of the platform; this will allow us to interface with the main process and the renderer process
interface AppProps {
	getProfile: () => Promise<ProfileProps>;
	getSettings: () => Promise<Settings>;
	systems: {
		storage: IStorage;
		asset: IAsset;
		api: IAPI;
		flags: IFlags;
		env: IEnvironment;
	}
}
async function AppInit({ getProfile, getSettings, systems }: AppProps) {
	return await createWaitFunction(
		new Promise(async (resolve) => {
			storage = systems.storage;
			assets = systems.asset;
			api = systems.api;
			flags = systems.flags;
			environment = systems.env ?? environment;
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
