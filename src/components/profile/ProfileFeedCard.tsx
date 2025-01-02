import { useEffect } from "react";
import { assets } from "../..";
import { APIMethods, APITypes } from "../../api/api";
import { ProfileSkeleton } from "../../object/Profile";
import { ProfilePageModifyState } from "../../views/Profile";
import '../styles/profile/profilefeed.scss';
import FeedComponent from "../feed/FeedComponent";

type ProfileFeedCardProps = {
	profile_obj: ProfileSkeleton;
} & ProfilePageModifyState;

export function ProfileFeedCard({ profile_obj, setProfile, extraData }: ProfileFeedCardProps) {

	useEffect(() => {
		/* grab the feed */
		if (profile_obj) {
			APIMethods.getPosts(profile_obj.id).then((posts) => {
				setProfile('feed', { loading: false, value: posts.posts });
			});
		}
	}, [profile_obj]);


	return (
		<div className={`profile-feed-card profile-page__content__section__box card ${extraData.feed.loading && 'loading'}`}>
			<span>Feed</span>
			<div className="profile-feed-card__posts scrollbar">
				{extraData.feed.value && extraData.feed.value?.map && extraData.feed.value?.map((post) => (
					<FeedComponent key={post.id} {...post} {...profile_obj} />
				))}
			</div>
		</div>
	);
}
