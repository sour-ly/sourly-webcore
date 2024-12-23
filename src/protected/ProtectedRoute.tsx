// this is a react route that checks if the user is authenticated, if not it will redirect to the login page
//

import { useEffect } from 'react';
import { Routes, useNavigate } from 'react-router-dom';
import { Authentication } from '../api/auth';
import { APIMethods } from '../api/api';
import { useWindow } from '../App';
import { flags, SourlyFlags } from '..';

type ProtectedRouteProps = {
	children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const navigation = useNavigate();
	const ctx = useWindow();

	useEffect(() => {
		const l = Authentication.on('logout', () => {
			navigation('/login');
		});

		const x = async () => {
			const refreshed = await Authentication.refresh(
				false,
				'protectedRoute::refresh',
			);

			if (!(flags.getFlags() & SourlyFlags.SEEN_MIGRATION)) {
				APIMethods.canMigrate(Authentication.loginState.state().userid).then((res) => {
					if (res && !('error' in res)) {
						if (res.status) {
							ctx.popUp.open({
								title: 'Migrate Account',
								content: () => (<p>It looks like you have offline data that can be migrated to the server. Would you like to migrate it now? Please note that once you make skills and goals you will not be able to migrate your account anymore. If you change your mind go to Settings and click Migrate Account</p>),
								type: 'confirm',
								options: {
									onOkay: () => {
										//call migartion
										APIMethods.migrate(Authentication.loginState.state().userid, res.profile).then((res) => {
											if (res && !('error' in res)) {
												Authentication.onlineMode(() => { });
												flags.or(SourlyFlags.SEEN_MIGRATION);
											}
										});
										ctx.popUp.close();
									},
									onCancel: () => {
										ctx.popUp.close();
										flags.or(SourlyFlags.SEEN_MIGRATION);
									}
								}
							});
						}
					}
				});
			}
			if (!refreshed) {
				navigation('/login');
				Authentication.logout();
			}
		};
		x();



		return () => {
			Authentication.off('logout', l);
		};
	}, []);

	return <>{children}</>;
}
