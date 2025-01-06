import '../styles/profile/profiledetailcard.scss';
import ProgressBar from '../ProgressBar';
import { Profile, ProfileSkeleton } from '../../object/Profile';
//import pfpimage from '../../../../assets/ui/pfp.jpg';
import { EditUsernameWrapper } from '../../model/popup/ProfilePopup';
import { assets, profileobj } from '../..';
import { Authentication } from '../../api/auth';
import { Button } from '../Button';
import { useEffect, useState } from 'react';
import { API, APIMethods } from '../../api/api';
import { ProfilePageLoadingState, ProfilePageModifyState } from '../../views/Profile';


function ProfilePicture() {
	const pfpimage = assets.getAsset('ui/pfp');
	return (
		<div className="profile-picture">
			<img src={pfpimage} alt="profile picture" />
		</div>
	);
}

type LevelMap = {
	[key: number]: string;
};

const levelMap: LevelMap = {
	1: 'Beginner',
	10: 'Intermediate',
	20: 'Advanced',
	30: 'Master',
	35: 'Wise',
	40: 'Grandmaster',
	50: 'Legendary',
	60: 'Mythical',
	70: 'Godly',
	90: 'Transcendent',
	100: 'Omnipotent',
	125: 'Infinite',
	150: 'Eternal',
	200: 'Incomprehensible',
	250: 'Unfathomable',
	350: 'Ineffable',
	1000: 'Cheater',
};

// return the level text based on the level, if the level is not in the map, return the highest level
// this returns the closest level text to the level
export function getLevelText(level: number): string {
	const keys = Object.keys(levelMap).map(Number);
	const key = keys.reduce((prev, curr) =>
		Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev,
	);
	return levelMap[key];
}

type ProductDetailCard = {
	profile_obj: ProfileSkeleton;
	editable?: boolean;
} & ProfilePageModifyState;

function ProductDetailCard({ profile_obj, editable, setProfile, extraData }: ProductDetailCard) {
	const profile = profileobj;
	const [followButtonLoading, setFollowButtonLoading] = useState(true);
	const [alreadyFollowing, setAlreadyFollowing] = useState(false);

	useEffect(() => {
		if (profile_obj && !editable) {
			APIMethods.refreshIfFailed(() => APIMethods.isFollowing(profile_obj.id)).then((res) => {
				if (res) {
					setAlreadyFollowing(res.following);
					setFollowButtonLoading(false);
				}
			}).catch((e) => {
				console.log(e);
			})
		}
	}, [])

	function followUser() {
		APIMethods.refreshIfFailed(() => APIMethods.followUser(profile_obj.id)).then((res) => {
			if (res) {
				setAlreadyFollowing(true);
				if (setProfile && extraData && extraData.followers.loading === false)
					setProfile && setProfile('followers', { ...extraData.followers, value: extraData.followers.value + 1 });
				//success
			}
		}).catch((e) => {
			//@TODO handle error
			//error
		})
	}

	function unfollowUser() {
		APIMethods.refreshIfFailed(() => APIMethods.unfollowUser(profile_obj.id)).then((res) => {
			if (res) {
				setAlreadyFollowing(false);
				if (setProfile && extraData && extraData.followers.loading === false) {
					setProfile('followers', { ...extraData.followers, value: extraData.followers.value - 1 });
				}
				//success
			}
		}).catch((e) => {
			//@TODO handle error
			//error
		})
	}


	return (
		<div className="profile-detail-card">
			<div className="profile-detail-card__header">
				<ProfilePicture />
				<div className="profile-detail-card__header__info">
					<div className="profile-detail-card__header__info__name">
						<h2>{profile_obj.name}</h2>
						{editable &&
							<EditUsernameWrapper profile={profile} />
						}
					</div>
					<div className="profile-detail-card__header__info__username">
						{!Authentication.getOfflineMode() && (
							<span>
								@{profile_obj.username}
							</span>
						)}
					</div>
					<div className="profile-detail-card__header__info__level">
						<span>
							{profile_obj.level > 9001 ? '9000+' : profile_obj.level}
						</span>
					</div>
					<div className="profile-detail-card__header__info__progress">
						<span>
							{profile_obj.currentExperience} XP /{' '}
							{Profile.calculateMaxExperience(profile_obj.level)} XP
						</span>
						<ProgressBar
							type="thick"
							max={Profile.calculateMaxExperience(profile_obj.level)}
							value={profile_obj.currentExperience}
						/>
					</div>
				</div>
			</div>
			<div className={`profile-detail-card__buttons ${followButtonLoading && 'loading'}`}>
				{!Authentication.getOfflineMode() && !editable && (
					<>
						<Button
							onClick={() => {
								if (alreadyFollowing) {
									unfollowUser();
								} else {
									followUser();
								}
							}}
							type="outline"
						>
							<div className="profile-detail-card__buttons__follow">
								{alreadyFollowing ? 'Unfollow' : 'Follow'}
							</div>
						</Button>
						<Button
							type="outline"
							className="profile-detail-card__buttons__extra"
							onClick={() => {
								//extras
							}}
						>
							<img src={assets.getAsset('ui/dots')} alt="more" />
						</Button>
					</>
				)}
			</div>
		</div>
	);
}

export default ProductDetailCard;
