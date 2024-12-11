import react from 'react';
import App from './App';
import IPC from './ReactIPC';
import { Log } from './log/log';
import { createWaitFunction } from './util/promise';
import { Profile } from './object/Profile';
import SettingsObject, { Settings } from './settings/settings';

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

const flags = 0;
async function AppInit() {
	return await createWaitFunction(

		new Promise((resolve) => {
			console.log('AppInit');
			sourlysettings = new SettingsObject();
			profileobj = new Profile();
			resolve(null);
		}),
		async () => {
			if (!environment) {
				// Handle the case where environment might not be ready
				throw new Error('Environment is not initialized');
			}
			return App;
		},
	);
}

export default AppInit;
