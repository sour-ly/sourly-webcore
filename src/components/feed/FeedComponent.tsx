import { assets } from "../..";
import { APITypes } from "../../api/api";
import { ProfileSkeleton } from "../../object/Profile";
import '../styles/feed/feedcomponent.scss';

type FeedEntry = ProfileSkeleton & APITypes.FeedPost;

export default function FeedComponent(props: FeedEntry) {
	return (
		<div className="feed-entry">
			<img src={assets.getAsset('ui/pfp')} alt="pfp" />
			<div className="feed-entry__content">
				<h2>{props.title}</h2>
				<p>{props.message.replace("$USERNAME$", props.name)}</p>
			</div>
		</div>
	);
}
