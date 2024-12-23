import { Log } from '../log/log';
import { api, endpoint, environment, storage } from '../index';
import { GoalProps } from '../object/Goal';
import { Profile, ProfileProps } from '../object/Profile';
import Skill, { SkillManager, SkillProps } from '../object/Skill';
import { profileobj, SourlyFlags } from '../index';
import Queue from '../util/queue';
import { Stateful } from '../util/state';
import { Authentication, LoginState } from './auth';
import { CredentialResponse } from '@react-oauth/google';

export namespace APITypes {
	export type APIError = {
		error: string;
		message: string;
		code: number;
	};

	export type LoginResponse = {
		user_id: number;
		accessToken: string;
		refreshToken: string;
	};

	export type RefreshResponse = {
		accessToken: string;
		refreshToken: string;
	};

	export type User = {
		id: number;
		username: string;
		name: string;
		level: number;
		currentExperience: number;
		created_at: string;
	};

	/*
	 *type Skill struct {
	ID         int            `json:"id"`
	Name       string         `json:"name"`
	Level      int            `json:"level"`
	CurrentExp int            `json:"currentExp"`
	CreatedAt  time.Time      `json:"created_at"`
	Goals      []dbtypes.Goal `json:"goals"`
 } */

	export type Skill = {
		id: number;
		name: string;
		level: number;
		currentExperience: number;
		created_at: string;
		hidden: boolean;
		goals: Goal[];
	};

	export type Goal = {
		id: number;
		skill_id: number;
		name: string;
		description: string;
		progress: number;
		metric: string;
		target: number;
		reward: number;
		created_at: string;
		completed: boolean;
	};

	/* UPDATE/REQUESTS */
	export type SkillUpdate = {
		id: string;
		name: string;
	}
}

type Optional<T> = T | undefined;

export namespace API {
	var BASE_URL = () => {
		return `${api?.endpoint ?? 'http://localhost:3000'}/api/v1/`
	};

	const headers = {
		'Content-Type': 'application/json',
	};

	async function refreshHook() {
		return Authentication.refresh(false, 'api::refreshHook');
	}

	export async function get<T>(
		//refresh 
		url: string,
		header: HeadersInit,
		signal?: AbortSignal
	): Promise<T | APITypes.APIError> {

		if (!url.includes('auth/refresh') && url.includes('/protected')) {
			const r = await refreshHook();
			if (!r) {
				return { error: 'refresh-failed', message: 'Refresh Failed', code: 401 };
			}
		}

		return fetch(BASE_URL() + url, {
			method: 'GET',
			headers: { ...headers, ...header },
			credentials: 'include',
			signal: signal
		})
			.then(async (res) => {
				const r = await res.json();
				if ('error' in r) {
					return { ...r, code: res.status };
				}
				return r;
			})
			.catch((_) => ({
				error: 'fetch-failed',
				message: 'Fetch Failed',
				code: 501,
			})) as Promise<T | APITypes.APIError>;
	}

	export async function post<T>(
		url: string,
		body: any,
		header: HeadersInit = {},
		signal?: AbortSignal
	): Promise<T | APITypes.APIError> {

		if (!url.includes('auth/refresh') && url.includes('/protected')) {
			const r = await refreshHook();
			if (!r) {
				return { error: 'refresh-failed', message: 'Refresh Failed', code: 401 };
			}
		}

		return fetch(BASE_URL() + url, {
			method: 'POST',
			headers: {
				...headers,
				...header,
			},
			credentials: 'include',
			body: JSON.stringify(body),
			signal: signal
		})
			.then(async (res) => {
				const r = await res.json();
				if ('error' in r) {
					return { ...r, code: res.status };
				}
				return r;
			})
			.catch((_) => ({
				error: 'fetch-failed',
				message: 'Fetch Failed',
				code: 501,
			})) as Promise<T | APITypes.APIError>;
	}

	export async function login(
		username: string,
		password: string,
	): Promise<LoginState | APITypes.APIError> {
		const r = await post<APITypes.LoginResponse>('auth/login', {
			username,
			password,
		});
		if ('error' in r) {
			return r;
		}
		return {
			null: false,
			userid: r.user_id,
			offline: false,
			username,
			accessToken: r.accessToken,
			refreshToken: r.refreshToken,
		};
	}

	export async function loginWithGoogle(googleResponse: CredentialResponse): Promise<LoginState | APITypes.APIError> {
		const r = await get<APITypes.LoginResponse>(`auth/login/google/web?code=${googleResponse.credential}`, {});
		if ('error' in r) {
			return r;
		}
		return {
			null: false,
			userid: r.user_id,
			offline: false,
			username: '',
			accessToken: r.accessToken,
			refreshToken: r.refreshToken,
		};
	}

	export async function refresh(
		headers: HeadersInit,
	): Promise<APITypes.RefreshResponse | APITypes.APIError> {
		try {
			const r = await get<APITypes.LoginResponse>('auth/refresh', headers);
			if ('error' in r) {
				return r;
			}
			return { accessToken: r.accessToken, refreshToken: r.refreshToken };
		} catch (e) {
			return { error: 'fetch-failed', message: 'Fetch Failed', code: 500 };
		}
	}

	type AsyncFunction = () => Promise<any | APITypes.APIError>;
	type AsyncFunctionIdentifiable = { fn: AsyncFunction; id: string };

	class APIQueue extends Queue<AsyncFunctionIdentifiable> {
		constructor() {
			super();
			// a few things need to be done: listen for first queues (when the list is empty), and then call next until the list is empty
			this.on('queueintoempty', () => {
				this.next();
			});
			this.on('queue', () => {
				//console.log('[APIQueue] Queued %s with ', this.length, this.data);
			})
			this.on('pop', () => {
				//console.log('[APIQueue] Popped %s with ', this.length, this.data);
			});

		}

		static genID(): string {
			return (
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15)
			);
		}

		// @TODO Remove src from the function signature
		public async queueAndWait(
			fn: AsyncFunction,
			src: string = '',
		): ReturnType<AsyncFunction> {
			const fnc = { fn, id: APIQueue.genID() };

			const promise = new Promise((resolve) => {
				this.once('pop', async (data) => {
					if (fnc.id === data.id) {
						const r = await data.fn();
						resolve(r);
						this.next();
					}
				});
			});
			this.queue(fnc);
			//console.log('[queueAndWait] Queued %s from %s', fn, src);
			return await promise;
		}

		// strictly internal use by APIQueue
		private async next() {
			this.pop();
		}
	}

	const queueObject = new APIQueue();
	export const queueAndWait = queueObject.queueAndWait.bind(queueObject);
	// dequeue should be called by the main process...
	export const dequeue = queueObject.pop.bind(queueObject);

}

namespace Offline {
	type GetSkillProps = {
		profileobj: Stateful<Profile | undefined>;
		flags: SourlyFlags;
	};

	export async function getLoginState(): Promise<LoginState> {
		return new Promise(async (resolve) => {
			if (!storage) {
				Log.log('storage:request', 1, 'storage is not defined');
				return resolve({ null: true, username: '', offline: true });
			}
			const arg = await storage.get('login');
			const data = arg;
			if (!data || Object.keys(data).length === 0) {
				Log.log('storage:request', 1, 'got a bad packet', data);
			} else {
				try {
					const json = data as any;
					resolve(json as LoginState);
				} catch (e) {
					Log.log(
						'storage:request',
						1,
						'failed to load login state from storage with error %s',
						e,
						data,
					);
				}
			}
			resolve({ null: true, username: '', offline: true });
		});
	}

	export async function getProfile(
		{ profileobj, flags }: GetSkillProps,
		callback: () => void = () => { },
	): Promise<Profile> {
		return new Promise(async (resolve) => {
			const arg = await storage.get('profile')
			// handle profile stuff
			const data = arg;
			if (!data || Object.keys(data).length === 0) {
				Log.log('storage:request', 1, 'got a bad packet', data);
			} else {
				try {
					const json = data as any;
					const npfp = new Profile(
						json.name,
						json.level,
						json.currentExperience,
						[],
						json.version ?? '0.0.0',
						json.flags ?? SourlyFlags.NULL,
					);
					if (!profileobj.state) {
						profileobj.setState(npfp);
					} else {
						profileobj.state.NameEventless = npfp.Name;
						profileobj.state.Level = npfp.Level;
						profileobj.state.CurrentExperience = npfp.CurrentExperience;
						profileobj.state.VersionEventless = npfp.Version;
						profileobj.state.FlagsEventless = npfp.Flags;
						profileobj.state.Skills = npfp.Skills;

					}
					Log.log('storage:request', 0, 'loaded profile from storage', data);
					resolve(profileobj.state as Profile);
					return;
				} catch (e) {
					Log.log(
						'storage:request',
						1,
						'failed to load profile from storage with error %s',
						e,
						data,
					);
				}
			}
			resolve(profileobj.state as Profile);
		});
	}

	export async function getSkills({
		profileobj,
		flags,
	}: GetSkillProps): Promise<void> {
		return await new Promise(async (resolve) => {
			console.log('getting skills');
			const arg = await storage.get('skill')
			const data = arg;
			console.log('got skills', data);
			let new_profile_flag = false;

			if (!profileobj.state || !(profileobj.state instanceof Profile)) {
				Log.log(
					'storage:request',
					1,
					'no profile object to load into, for now we will just create a new one but later we will need to handle this better',
				);
				profileobj.setState(new Profile());
				new_profile_flag = true;
				flags |= SourlyFlags.NEW_PROFILE;
			} else {
				flags |= profileobj.state.Flags;
			}

			if (!profileobj.state || profileobj.state.Flags & SourlyFlags.IGNORE) {
				throw new Error('profile object is still undefined');
			}

			if (!data || Object.keys(data).length === 0) {
				Log.log('storage:request', 1, 'got a bad packet or no skills', data);
				flags |= SourlyFlags.NO_SKILLS;
				resolve(undefined);
			} else if (Array.isArray(data)) {
				try {
					for (const skill of data) {
						profileobj.state.addSkillFromJSON(skill);
					}
					Log.log('storage:request', 0, 'loaded skills from storage', data);
				} catch (e) {
					Log.log(
						'storage:request',
						1,
						'failed to load skills from storage',
						data,
						e,
					);
				}
			}
			if (new_profile_flag) {
				Log.log(
					'storage:request',
					0,
					'new profile object created, adjusting to skills',
				);
				profileobj.state.adjustProfileToSkills();
			}
			resolve(undefined);
		});
	}

	export async function saveSkillsOffline(skills: object): Promise<void> {
		storage.save('skill', skills);
	}

	export async function saveProfileOffline(profile: object): Promise<void> {
		storage.save('profile', profile);
	}
}

type GetSkillProps = {
	profileobj: Stateful<Profile | undefined>;
	flags: SourlyFlags;
};
namespace Online {
	// protected, need to have a token to access this
	function token() {
		return {
			accessToken: Authentication.loginState.state().accessToken,
			refreshToken: Authentication.loginState.state().refreshToken,
		};
	}

	function header() {
		Authentication.authCookies();
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token().accessToken}`,
		};
	}

	export async function signup(username: string, password: string, email: string, name: string): Promise<APITypes.User | APITypes.APIError> {
		return await API.post<APITypes.User | APITypes.APIError>('auth/register', { username, password, email, name });
	}

	/* MIGRATION STUFF */
	export async function canMigration(uid: string | number): Promise<{ status: boolean } | APITypes.APIError> {
		return await API.get<{ status: boolean }>(`protected/user/${uid}/canmigrate`, header());
	}

	export async function migrate(uid: string | number, profile: ProfileProps & { skills: SkillProps[] }) {
		return await API.post<APITypes.User | APITypes.APIError>(`protected/user/${uid}/migrate`, profile, header());
	}

	/* PROFILE STUFF */
	export async function getProfile(uid: string | number): Promise<APITypes.User | APITypes.APIError> {
		const r = await API.get<APITypes.User>(
			`protected/user/${uid}/profile`,
			header(),
		);
		return r;
	}

	export function setProfile(
		{ profileobj, flags }: GetSkillProps,
		user_obj: APITypes.User,
	) {
		if (!profileobj.state) {
			profileobj.setState(new Profile());
		}
		if (!profileobj.state) {
			throw new Error('profile object is still undefined');
		}
		profileobj.state.NameEventless = user_obj.name;
		profileobj.state.Level = user_obj.level;
		profileobj.state.CurrentExperience = user_obj.currentExperience;
		profileobj.state.Flags = flags & ~SourlyFlags.IGNORE;
	}

	// okay lets search for users
	export function searchUser(username: string, callback: (users: APITypes.User[] | APITypes.APIError) => void) {
		const signal = new AbortController();
		const r = API.post<APITypes.User[]>(`protected/user/search?name=${username}`, {}, header(), signal.signal);
		r.then((data) => {
			callback(data);
		});
		return { abort: signal, promise: r as Promise<APITypes.User | APITypes.APIError> };
	}

	export function refreshToken() {
		return API.refresh(header());
	}

	export async function refreshFirst<T>(
		callback: () => T,
	): Promise<T | undefined> {
		const r = await Authentication.refresh(false, 'refreshFirst');
		if (!r) {
			return undefined;
		}
		// handle the refresh token
		return await callback();
	}

	/* SKILL METHODS */
	export async function addSkills(name: string) {
		return await API.post<{ skill: APITypes.Skill }>(
			`protected/skill/add`,
			{
				name,
			},
			header(),
		);
	}

	export async function getSkills() {
		return await API.get<APITypes.Skill[]>(`protected/skill/`, header());
	}

	export async function editSkill(srq: APITypes.SkillUpdate) {
		return await API.post<APITypes.Skill>(
			`protected/skill/${srq.id}/edit`,
			srq,
			header(),
		);
	}

	export async function deleteSkill(skill_id: number) {
		return await API.get<APITypes.APIError>(
			`protected/skill/${skill_id}/delete`,
			header(),
		);
	}


	/* GOAL METHODS */
	export async function addGoal(skill_id: number, goalProps: GoalProps) {
		const newSkill = await API.post<{ skill: APITypes.Skill }>(
			`protected/skill/${skill_id}/goal/add`,
			{
				skill_id,
				...goalProps,
			},
			header(),
		);
		return newSkill;
	}

	export async function editGoal(skill_id: number, goal_id: number, goalProps: GoalProps) {
		return await API.post<APITypes.Goal>(
			`protected/skill/${skill_id}/goal/${goal_id}/edit`,
			goalProps,
			header(),
		);
	}

	//increment goal progress
	export async function incrementGoal(goal_id: number, skill_id: number) {
		return await API.get<APITypes.Skill>(
			`protected/skill/${skill_id}/goal/${goal_id}/inc`,
			header(),
		);
	}

	//undo goal progress
	export async function undoGoal(goal_id: number, skill_id: number) {
		return await API.get<APITypes.Skill>(
			`protected/skill/${skill_id}/goal/${goal_id}/dec`,
			header(),
		);
	}

	export async function deleteGoal(goal_id: number, skill_id: number) {
		return await API.get<APITypes.APIError>(
			`protected/skill/${skill_id}/goal/${goal_id}/delete`,
			header(),
		);
	}

	//goal stuff

	export async function editProfileName(name: string) {
		return await API.post<APITypes.User>(
			`protected/user/${Authentication.loginState.state().userid ?? -1}/editname`,
			{ name },
			header(),
		);
	}


}

export namespace APIMethods {
	export async function getLoginState(): Promise<LoginState> {
		return await Offline.getLoginState();
	}

	export function isOffline(): boolean {
		const loginState = Authentication.loginState.state();
		return loginState.offline;
	}

	export async function getSkillsOffline({
		profileobj,
		flags,
	}: GetSkillProps): Promise<void> {
		const profile = await Offline.getProfile({ profileobj, flags });
		console.log('got profile', profile);
		await Offline.getSkills({
			profileobj: { state: profile, setState: profileobj.setState },
			flags,
		});
	}


	// online stuff
	//

	//signup
	export async function signup(
		username: string,
		password: string,
		email: string,
		name: string,
	) {
		return await Online.signup(username, password, email, name);
	}

	export async function getSkills({
		profileobj,
		flags,
	}: GetSkillProps): Promise<void> {
		// see if the user is online
		if (Authentication.getOfflineMode()) {
			await getSkillsOffline({ profileobj, flags });
		} else {
			// TODO: please move this to the online namespace
			// get the profile
			// refresh before we do anything
			const resp = await Authentication.refresh(false, 'getSkills');
			if (!resp) {
				// return handle the error
				return;
			}
			const user = await API.queueAndWait(
				//this is a self grab
				async () => await Online.getProfile(Authentication.loginState.state().userid ?? 0),
				'getSkills::350',
			);
			Online.setProfile({ profileobj, flags }, user);
			if (!profileobj.state) {
				throw new Error('profile object is still undefined');
			}
			const skills = await API.queueAndWait(
				async () => await Online.getSkills(),
				'getSkills::355',
			);
			if ('error' in skills) {
				return;
			}
			const skillProps: SkillProps[] = skills.map((skill: APITypes.Skill) => {
				return {
					id: `${skill.id}`,
					name: skill.name,
					level: skill.level,
					currentExperience: skill.currentExperience,
					hidden: skill.hidden,
					goals: skill.goals.map((goal: APITypes.Goal) => ({
						id: `${goal.id}`,
						name: goal.name,
						description: goal.description,
						progress: goal.progress,
						metric: goal.metric,
						target: goal.target,
						reward: goal.reward,
						completed: goal.completed,
					})) as GoalProps[],
				};
			});
			// changed method to set entire array rather than adding.
			const skillObject = skillProps.map((s) => Profile.castSkillFromJSON(s));
			if (profileobj.state) {
				profileobj.state.Skills = skillObject;
			}
		}
	}

	export async function saveSkills(
		skills: any,
		onlineFlags: 'create' | 'update' | 'delete' = 'create',
	) {
		if (Authentication.getOfflineMode()) {
			await Offline.saveSkillsOffline(skills);
			return true;
		}
		if (onlineFlags === 'create') {
			// create the skill
			const r = await API.queueAndWait(() => Online.addSkills(skills.name), "saveSkills");
			if ('error' in r) {
				return r;
			}
			return r.skill;
		} else if (onlineFlags === 'delete') {
			const r = await API.queueAndWait(() => Online.deleteSkill(skills.id), "saveSkills");
			return r;
		} else if (onlineFlags === 'update') {
			const r = await API.queueAndWait(() => Online.editSkill(skills), "saveSkills");
			return r;
		}

		return false;
	}

	export async function updateGoal(goal_id: number, skill_id: number, goalProps: GoalProps) {
		if (Authentication.getOfflineMode()) {
			return true;
		}
		return API.queueAndWait(() => Online.editGoal(skill_id, goal_id, goalProps), "updateGoal");
	}

	export async function removeSkill(skill_id: number) {
		if (Authentication.getOfflineMode()) {
			return true;
		} else {

			const r = await API.queueAndWait(() => Online.deleteSkill(skill_id), "removeSkill");
			if ('error' in r) {
				return false;
			}
			return true;
		}
	}

	export async function getProfile(uid: string | number) {
		if (Authentication.getOfflineMode()) {
			return profileobj;
		}
		return await API.queueAndWait(() => Online.getProfile(uid));
	}

	export function searchUser(username: string, callback: (users: APITypes.User[] | APITypes.APIError) => void) {
		return Online.searchUser(username, callback);
	}

	export async function saveProfile(profile: Partial<ProfileProps>, changed: ('all' | keyof ProfileProps) = "all") {
		if (Authentication.getOfflineMode()) {
			await Offline.saveProfileOffline(profile);
			return {};
		} else {
			//if all is changed, we need to check all the fields, however we are just going to check the name for now
			if (changed === 'all' || changed === 'name') {
				if (!profile.name) {
					return { error: 'no-name', message: 'No name provided' };
				}
				//the "" won't matter because of the check above --- pesky typescript linter
				const r = await API.queueAndWait(() => Online.editProfileName(profile.name ?? ""), "saveProfile");
				return r;
			}
		}
	}

	export async function incrementGoal(goal_id: number, skill_id: number = 0) {
		if (Authentication.getOfflineMode()) {
			return true;
		}
		return API.queueAndWait(() => Online.incrementGoal(goal_id, skill_id), "incrementGoal");
	}

	export async function undoGoal(goal_id: number, skill_id: number = 0) {
		if (Authentication.getOfflineMode()) {
			return true;
		}
		return API.queueAndWait(() => Online.undoGoal(goal_id, skill_id), "undoGoal");
	}

	export async function refresh() {
		if (Authentication.getOfflineMode()) {
			return;
		}
		return await Online.refreshToken();
	}

	/* Refresh Only If Failed */
	export async function refreshIfFailed<T extends object | APITypes.APIError>(f: () => Promise<T>): Promise<T> {
		if (Authentication.getOfflineMode()) {
			return f();
		}
		//first lets try to get the data
		const r = await f();
		if ('error' in r && r.code === 401) {
			//lets try to refresh
			let tries = 0;
			let rr = await Authentication.refresh(false, 'refreshIfFailed');
			//this is a bit of a hack, but try to refresh 3 times and see if it works - thanks a lot <ProtectedRoute />...
			while (!rr && tries < 3) {
				rr = await new Promise((resolve) => {
					setTimeout(async () => {
						resolve(await Authentication.refresh(false, 'refreshIfFailed'));
					}, 500);
				});
				tries++;
			}
			if (rr) {
				//lets try to get the data again
				return await f();
			}
		} else {
			return r; //TODO:handle the error as is
		}
	}

	export async function addGoal(skill_id: number, goalProps: GoalProps) {
		if (Authentication.getOfflineMode()) {
			return true;
		} else {
			return await API.queueAndWait(() => Online.addGoal(skill_id, goalProps), "addGoal");
		}
	}

	export async function removeGoal(goal_id: number, skill_id: number = 0) {
		if (Authentication.getOfflineMode()) {
			return true;
		}
		return await API.queueAndWait(() => Online.deleteGoal(goal_id, skill_id), "removeGoal");
	}

	//MIGRATION STUFF
	export async function canMigrate(uid: string | number): Promise<({ status: boolean, profile?: ProfileProps } | APITypes.APIError)> {
		if (Authentication.getOfflineMode()) {
			return { status: false };
		}
		if (!Authentication.loginState.state() || Authentication.loginState.state().null || !Authentication.loginState.state().userid || !Authentication.loginState.state().accessToken || Authentication.loginState.state().offline) {
			return { status: false };
		}
		//api response
		const apiResponse = await API.queueAndWait(() => Online.canMigration(uid), 'canMigrate');

		//lets first check if we have offline data 
		let oProfile = new Profile();
		let offlineData = await Offline.getProfile({
			profileobj: {
				state: oProfile,
				setState: (p: Profile) => { oProfile = p; },
			}, flags: SourlyFlags.NULL
		});
		oProfile = offlineData;
		if (!offlineData) {
			return { status: false };
		}
		//now lets check if the offline data has any skills
		await Offline.getSkills({
			profileobj: {
				state: oProfile,
				setState: (p: Profile) => { oProfile = p; },
			}, flags: SourlyFlags.NULL
		});
		//whatever let them do it i guess, but lets make this function return the offline data
		//
		const skills = oProfile.serializeSkills().map((skill) => {
			return {
				...skill, goals: skill.goals.map((goal) => {
					return { ...goal, skill_id: skill.id, id: Number(goal.id) };
				})
			}
		});

		return { ...apiResponse, profile: { ...oProfile.serialize(), skills } };
	}

	export async function migrate(uid: string | number, profile: ProfileProps & { skills: SkillProps[] }) {
		if (Authentication.getOfflineMode()) {
			return { error: 'offline-mode', message: 'Cannot migrate in offline mode' };
		}
		return await API.queueAndWait(() => Online.migrate(uid, profile), 'migrate');
	}



}
