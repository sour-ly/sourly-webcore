import { environment } from '../..';
import { MSCompatiableScreen } from '../MessageScreen';

export function VersionPage() {
	return (
		<>
			<div className="messagescreen__content__main__body__section">
				<h2>Whats New?:</h2>
				<p>
					Welcome to the new 0.1.1 version of Sourly! This version changes a lot and adds a bit more to the application. This leap forward is pivotal in the development of the application, and I hope you enjoy the new features that have been added.
				</p>
				<p>
					First and foremost, the addition of the backend API is a huge step forward in the development of the application. This will allow the application to be more dynamic and allow for more features to be added in the future. This allows us to sync our data with multiple devices, and allows us to have a more robust system for the application. This also opens the door for more API-like features, such as a websocket notification system, social features, inventory, and more.
				</p>
				<p>
					The most neat feature that has been added is the Google Authentication system. This allows you to sign in with your Google account, and allows you to sync your data with multiple devices. This is a huge step forward in the development of the application, and I hope you enjoy this feature.
				</p>
				<p>
					Last but not least, the application has been ported to the web. This allows you to use the application on any device, and allows you to sync your data with multiple devices. This is a huge step forward in the development of the application, and I hope you enjoy this feature.
				</p>
				<h3> TL;DR </h3>
				<ul>
					<li>Ported Sourly to the web</li>
					<li>Added API</li>
					<li>Added Google Authentication</li>
					<li>Fixed a lot of bugs</li>
					<li>Maintained the same look and feel</li>
					<li>Offline to Online (one-time) migration</li>
				</ul>
			</div>
			<div className="messagescreen__content__main__body__section">
				<h2>Next:</h2>
				<p>
					There are a few things that are planned for the next version of the
					application, such as:
				</p>
				<ul>
					<li>Adding a notification system from the backend server</li>
					<li>A mobile-friendly version of the application</li>
					<li>Adding a social feature to the application</li>
					<li>Very simple inventory and drop system</li>
				</ul>
			</div>
		</>
	);
}

export const VersionPageContext: MSCompatiableScreen = {
	header: [
		{ text: 'New Version: ', color: '' },
		{ text: '', color: 'red' },
	],
	body: <VersionPage />,
};
