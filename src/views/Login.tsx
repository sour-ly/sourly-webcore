import { useEffect, useState } from 'react';
import { Authentication } from '../api/auth';
import { Button } from '../components/Button';
import Input from '../components/Input';
import './styles/login.scss';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useWindow } from '../App';
import { useStateUtil } from '../util/state';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from '../util/link';
import { api } from '..';
import { Electron } from '../util/electron';

export function OfflinePopup() {
	return (
		<div className="popup__content">
			<p>
				Using Sourly in offline mode will disable all network features, such as
				syncing, sharing, social features, and more.
			</p>
			<p>
				You are able to transfer this offline profile to an online profile at
				any time.
			</p>
		</div>
	);
}

export function Login() {
	const navigation = useNavigate();
	const ctx = useWindow();
	const [inputData, setInputData] = useState({ username: '', password: '' });
	const [loading, setLoading] = useState(false);
	const update = useStateUtil(setInputData);
	const queryParams = new URLSearchParams(window.location.search)


	useEffect(() => {
		const x = async () => {
			const r = Authentication.getLoggedIn();
			if (r) {
				// navigate to the main page
				console.log('logged in');
			}
		};
		x();
		const z = Authentication.on('loginStateChange', (state) => {
			if (state.state.null) {
				// logged out
				navigation('/login');
			} else {
				// logged in
			}
		});

		const e = {
			token: queryParams.get('token'),
			refresh_token: queryParams.get('refresh_token'),
			user_id: queryParams.get('user_id'),
			error: queryParams.get('error'),
			code: queryParams.get('code'),
			message: queryParams.get('message'),
		};

		if (e.token && e.refresh_token && e.user_id) {
			Authentication.absorbTokens(e.token, e.refresh_token, e.user_id).then(r => {
				if ("error" in r) {
					ctx.popUp.open({
						type: 'dialog',
						title: 'Login Error',
						content: () => <p>There was an error with using Google to Login. We are sorry about the inconvience.</p>,
						options: {
							onOkay: () => {
								ctx.popUp.close();
							},
							onCancel: () => {
								ctx.popUp.close();
							},
						},
					})
				} else {
					//just do nothing, let some component listen to us
					navigation('/');
					window.location.search = '';
				}
			});
			//refresh
		} else if (e.error && e.code && e.message) {
			//error
			ctx.popUp.open({
				type: 'dialog',
				title: 'Login Error',
				content: () => <p>{e.message}</p>,
				options: {
					onOkay: () => {
						ctx.popUp.close();
					},
					onCancel: () => {
						ctx.popUp.close();
					},
				},
			})
		}

		return () => {
			Authentication.off('loginStateChange', z);
		};
	}, []);

	// switch to offline mode
	function offlineMode() {
		ctx.popUp.open({
			type: 'dialog',
			content: OfflinePopup,
			title: 'Offline Mode',
			options: {
				onOkay: () => {
					Authentication.offlineMode(() => {
						navigation('/');
						ctx.popUp.close();
					});
				},
				onCancel: () => {
					ctx.popUp.close();
				},
			},
		});
	}

	function login() {

		const content = {
			'fetch-failed': "It seems that the backend server is down, please try again. We apologize for this inconvience.",
			'invalid-credentials': "Invalid credentials, please try again.",
			'username-password-bad': "Either the username or password is incorrect, please try again.",
			'user-not-verified': "Your account has not been verified, please check your email for the verification link.",
			'unknown': "An unknown error occured, please try again.",
		}

		function getErrorContent(error: string) {
			console.log(error);
			return content[error as keyof typeof content] ?? content['unknown'];
		}

		setLoading(true);
		Authentication.login(inputData.username, inputData.password, (state) => {
			setLoading(false);
			if (state.loginState.null) return;
			navigation('/');
		})
			.then((z) => {
				if (typeof z === 'boolean') {
					// logged in
					//
				} else {
					ctx.popUp.open({
						type: 'dialog',
						title: 'Login Error',
						content: () => <p>{getErrorContent(z)}</p>,
						options: {
							onOkay: () => {
								ctx.popUp.close();
							},
							onCancel: () => {
								ctx.popUp.close();
							},
						},
					});
				}
			})
			.catch((e) => { }).finally(() => {
				setLoading(false)
			});
	}

	return (
		<main className="login">
			<div className={`login__container card ${loading && 'card-loading'}`}>
				<h1>Login To Sourly</h1>
				<p>Welcome to Sourly, please login to continue</p>
				<div className="login__container__inputs">
					<Input
						label="Username"
						placeholder="Username"
						onChange={(e) => update('username', e.currentTarget.value)}
					/>
					<Input
						label="Password"
						placeholder="Password"
						type="password"
						onChange={(e) => update('password', e.currentTarget.value)}
					/>
				</div>
				<div className="login__container__links">
					<Button type="solid" onClick={login}>
						Login
					</Button>
					<Button type="outline" onClick={() => Link.NewTab(api.endpoint + `/api/v1/auth/login/google?source=${Electron.isUsingElectron() ? 'electron' : 'web'}`)}>
						Login using Google
					</Button>
					<Button type="outline" onClick={offlineMode}>
						Offline Mode
					</Button>
				</div>
			</div>
		</main>
	);
}
