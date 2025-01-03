import { useState } from "react";
import { assets, profileobj } from "../..";
import { APITypes } from "../../api/api";
import { ProfileSkeleton } from "../../object/Profile";
import { sqltimetojsdate } from "../../util/sqltime";
import '../styles/feed/feedcomponent.scss';
import { useNavigate } from "react-router-dom";

type FeedEntry = ProfileSkeleton & APITypes.FeedPost;

export default function FeedComponent(props: FeedEntry) {

	const isSelf = props.id === profileobj.serialize().id;
	const username = isSelf ? 'You' : props.name;
	const navigate = useNavigate();

	function parseUsername(str: string) {

		let s = str.replace("$USERNAME$", username);
		if (isSelf) {
			s = s.replace("has", "have");
		}

		return s;
	}

	return (
		<div className="feed-entry" onClick={() => navigate(`/profile?uid=${props.user_id}`)}>
			<img src={assets.getAsset('ui/pfp')} alt="pfp" />
			<div className="feed-entry__content">
				<h2>{parseUsername(props.title)}</h2>
				<p>{parseUsername(props.message)}</p>
			</div>
			<div className="feed-entry__time">
				<p>{sqltimetojsdate(props.created_at).toFormattedString()}</p>
			</div>
		</div>
	);
}
