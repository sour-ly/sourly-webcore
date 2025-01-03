import { useEffect, useState } from "react";
import { APIMethods, APITypes } from "../api/api";
import { Authentication } from "../api/auth";
import FeedComponent from "../components/feed/FeedComponent";
import { profileobj } from "..";
import { ProfileSkeleton } from "../object/Profile";
import './styles/feed.scss';

export default function Feed() {

	const [feedPosts, setFeedPosts] = useState<APITypes.FeedPost[]>([]);
	const [usersCache, setUsersCache] = useState<{ [key: number]: ProfileSkeleton }>({});

	useEffect(() => {
		feedSync();
	}, []);

	async function feedSync() {
		const posts = await APIMethods.refreshIfFailed(() => APIMethods.getFeed(Authentication.loginState.state().userid));
		//get the posts
		let obj = { ...usersCache };
		for (const post of posts.posts) {
			if (!(post.user_id in usersCache)) {
				if (post.user_id === profileobj.serialize().id) {
					setUsersCache((prev) => {
						return { ...prev, [post.user_id]: profileobj.serialize() };
					});
				} else {
					const user = await APIMethods.getProfile(post.user_id);
					obj[post.user_id] = user;
				}
			}
		}
		setUsersCache(obj);
		setFeedPosts(posts.posts);
	}

	return (
		<main className="feed">
			<h1>Feed</h1>
			<div className="feed scrollbar">
				{feedPosts.map((post) => (
					usersCache[post.user_id] &&
					<FeedComponent key={post.id} {...usersCache[post.user_id]} {...post} />
				))}
			</div>
		</main>
	);
}
