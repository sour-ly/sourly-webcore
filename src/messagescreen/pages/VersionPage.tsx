import { environment } from '../..';
import { MSCompatiableScreen } from '../MessageScreen';

export function VersionPage() {
	return (
		<>
			<div className="messagescreen__content__main__body__section">
				<h2>Whats New?:</h2>
				<p>
					Welcome to the new 0.2.0 version of Sourly! This is a big update that includes a whole bunch of social features, as well as a few bug fixes and performance improvements. Here are some of the highlights:
				</p>
				<b>Follower System:</b> You can now follow other users and see their posts in your feed. You can also get notified when they post something new. This is a great way to stay connected with your friends and see what they're up to. This system is still in beta, and not everything is implemented yet, but we're working on it! You can expect more features such as a notification page, a way to see who is following you, and group skills in the future!
				<p>
					<b>Notification System:</b> We've added a new notification system that will let you know when you've been followed, and when you're profile has leveled up. While this system is still in beta, we're working on adding more notifications in the future; there just isn't a lot to notify you about yet!
				</p>
				<p>
					<b>Feed:</b> You can now see posts from users you follow in your feed. This is a great way to stay up to date with what your friends are doing. This is still in beta (just like everything else), so expect more features in the future! You can expect liking and engaging with other users posts, a way to see who liked your posts, and more in-depth feed customization in the future!
				</p>
				<p>
					<b>Profile Page:</b> We've noticed that the profile page was a bit lacking and barebones, so we've rehauled it! You can now see your followers, following, and skills on your profile page. On top of that, we've added a Top Skill and Feed section to the profile page to give you a better overview of your profile. We're still working on adding more features to the profile page, such as a way to see who is following you, a way to see who liked your posts, and more in-depth profile customization in the future!
				</p>
				<h3> TL;DR </h3>
				<ul>
					<li>Follow other users and see their posts in your feed</li>
					<li>Get notified when you're followed or when your profile levels up</li>
					<li>See posts from users you follow in your feed</li>
					<li>See your followers, following, and skills on your profile page</li>
					<li>Added a Top Skill and Feed section to the profile page</li>
				</ul>
			</div>
			<div className="messagescreen__content__main__body__section">
				<h2>Next:</h2>
				<p>
					We're not done yet! We want to add more features to Sourly to make it the best it can be. Here are some of the things we're working on:
				</p>
				<ul>
					<li>More social features, such as liking and reacting to posts</li>
					<li>More notifications, such as when someone likes your post</li>
					<li>More feed customization options, such as filtering posts by skill, user, or even see what other people are doing</li>
					<li>More profile customization options, such as changing your profile picture</li>
					<li>Group Skills, a shared skill that multiple users can contribute to</li>
					<li>Item System, a way to reward users for their achievements by giving them items</li>
					<li>More performance improvements and bug fixes</li>
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
