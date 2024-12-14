import './styles/settings.scss';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { environment, profileobj, sourlysettings } from '..';
import { useStateUtil } from '../util/state';
import { DisplayNumber, NumberInputFilter } from '../input/filter';
import { sDefault } from '../settings/settings';
import { useWindow } from '../App';
import {
	WelcomePageSlideOneContext,
	WelcomePageSlideTwoContext,
} from '../messagescreen/pages/WelcomePage';
import { VersionPageContext } from '../messagescreen/pages/VersionPage';
import { Button } from '../components/Button';
import { Authentication } from '../api/auth';
import { APIMethods } from '../api/api';
import { ProfileProps } from '../object/Profile';
import { SkillProps } from '../object/Skill';

type CheckboxProps = {
	state: boolean;
	onChange: (state: boolean) => void;
	label: string;
};

function Checkbox({ state, onChange, label }: CheckboxProps) {
	return (
		<label className="checkbox">
			<input
				type="checkbox"
				checked={state}
				onChange={(e) => onChange(e.target.checked)}
			/>
			<span>{label}</span>
		</label>
	);
}

function NumberInput({
	value,
	onChange,
	label,
}: {
	value: number;
	onChange: (value: number) => void;
	label: string;
}) {
	function onBlur(e: React.FocusEvent<HTMLInputElement>) {
		if (e.target.value === '' || isNaN(value)) {
			onChange(0);
		}
	}

	return (
		<label className="number-input">
			<input
				type="number"
				value={DisplayNumber(value, { defaultValue: ' ' })}
				onChange={(e) =>
					onChange(
						NumberInputFilter(e.target.value, { min: -1, allowNaN: true }),
					)
				}
				onBlur={onBlur}
			/>
			<span>{label}</span>
		</label>
	);
}

function Settings() {
	/* window context */
	const ctx = useWindow();
	const settings = sourlysettings;
	const [settings_copy, setSettings] = useState(settings);
	const [canMigrate, setCanMigrate] = useState(false);
	const [migrationData, setMigrationData] = useState<ProfileProps & { skills: SkillProps[] }>(null);
	const change = useStateUtil(setSettings);
	/* navigation */
	const navigation = useNavigate();

	useEffect(() => {
		APIMethods.canMigrate(Authentication.loginState.state().userid)
			.then((res) => {
				if (res && !("error" in res)) {
					// set this to the result of the response
					if (res.profile) {
						setCanMigrate(res.status);
						setMigrationData(res.profile);
					}
				} else {
					setCanMigrate(false);
				}
			});
	}, [])

	useEffect(() => {
		settings.setAll(settings_copy);
	}, [settings_copy]);

	function logout() {
		Authentication.logout();
		// navigation('/login');
	}

	function migrate() {
		ctx.popUp.open({
			title: 'Migrate Account',
			content: () => (
				<p>
					Would you like to migrate your offline data to the server?
					Please note that once you migrate you cannot migrate again. (You can still use the app offline)
					Adding skills and goals will prevent you from migrating .
				</p>
			),
			type: 'confirm',
			options: {
				onOkay: () => {
					//execute migration
					APIMethods.migrate(
						Authentication.loginState.state().userid,
						migrationData
					).then((res) => {
						if (res && !("error" in res)) {
							//refresh profile
							Authentication.onlineMode(() => { });
							ctx.popUp.open({
								title: 'Migration Successful',
								content: () => (
									<p>
										Your offline data has been successfully migrated to the server.
									</p>
								),
								type: 'dialog',
								options: {
									onOkay: () => {
										setCanMigrate(false);
										ctx.popUp.close();
									},
									onCancel: () => {
										ctx.popUp.close();
									}
								},
							});
						}
					}).finally(() => {
						ctx.popUp.close();
					});
				},
				onCancel: () => {
					ctx.popUp.close();
				},
			},
		});
	}

	return (
		<main className="settings">
			<h1>Settings</h1>
			<div className="settings__content">
				<div className="settings__content__section">
					<p className="label">System Information</p>
					<p style={{ marginTop: '.3rem' }}>Version: v{environment.version}</p>
					<p style={{ marginTop: '.3rem' }}>Mode: {environment.mode}</p>
					<p style={{ marginTop: '.3rem' }}>Platform: {environment.platform}</p>
				</div>
				<div className="settings__content__section">
					<p className="label">Theme Settings</p>
					<Checkbox
						state={settings_copy.theme === 'dark'}
						onChange={(state) => {
							change('theme', !state ? 'light' : 'dark');
						}}
						label="Enable Dark Mode"
					/>
				</div>
				<div className="settings__content__section">
					<p className="label">Notification Settings</p>
					<Checkbox
						state={!settings_copy.notification.enabled}
						onChange={(state) => {
							change('notification', {
								...settings_copy.notification,
								enabled: !state,
							});
						}}
						label="Disable Notification Alerts"
					/>
					<NumberInput
						value={settings_copy.notification.duration / 1000}
						onChange={(value) => {
							change('notification', {
								...settings_copy.notification,
								duration: value * 1000,
							});
						}}
						label="Notification Duration"
					/>
				</div>
				<div className="settings__content__section">
					<Button
						style={{ marginTop: '1rem' }}
						type="outline"
						onClick={() =>
							ctx.msgScreen.open(
								WelcomePageSlideOneContext,
								WelcomePageSlideTwoContext,
							)
						}
						className="settings__welcome"
					>
						See Welcome Screen
					</Button>

					<Button
						style={{ marginTop: '1rem' }}
						type="outline"
						onClick={() => ctx.msgScreen.open(VersionPageContext)}
						className="settings__notes"
					>
						See Version Notes
					</Button>
					<Button
						style={{ marginTop: '1rem' }}
						type="outline"
						onClick={() => setSettings({ ...settings_copy, ...sDefault })}
						className="settings__save"
					>
						Reset Settings
					</Button>
					<Button
						style={{ marginTop: '1rem' }}
						type="outline"
						onClick={migrate}
						className="settings__save"
						disabled={!canMigrate}
					>
						Migrate Offline Data
					</Button>
					<Button
						style={{ marginTop: '1rem' }}
						type="solid"
						onClick={logout}
						className="settings__save"
					>
						Logout
					</Button>
				</div>
			</div>
		</main>
	);
}

export default Settings;
