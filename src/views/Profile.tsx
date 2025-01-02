import { useEffect, useState } from 'react';
import { ProfileSkeleton } from '../object/Profile';
import { profileobj } from '..';
import ProductDetailCard from '../components/profile/ProfileDetailCard';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { APIMethods, APITypes } from '../api/api';
import { Log } from '../log/log';
import './styles/profile.scss';
import { useStateUtil } from '../util/state';
import { Authentication } from '../api/auth';
import { ProfileTopSkillCard } from '../components/profile/ProfileTopSkillCard';
import { ProfileSkillCard } from '../components/profile/ProfileSkillsCard';
import { ProfileFeedCard } from '../components/profile/ProfileFeedCard';


type LoadState<V> = {
	loading: boolean,
	value?: V,
}

//true if the profile is loading
export type ProfilePageLoadingState = {
	profile: LoadState<ProfileSkeleton>,
	skills: LoadState<number>,
	followers: LoadState<number>,
	following: LoadState<number>,
	feed: LoadState<APITypes.FeedPost[]>,
}

export type ProfilePageModifyState = {
	extraData?: ProfilePageLoadingState;
	setProfile?: (key: keyof ProfilePageLoadingState, value: ProfilePageLoadingState[keyof ProfilePageLoadingState]) => void;
}


const DEFAULT_LOADING_STATE: ProfilePageLoadingState = {
	profile: { loading: true },
	skills: { loading: true },
	followers: { loading: true },
	following: { loading: true },
	feed: { loading: true },
}


//we are going to grab the profile id rather than using the profileobj
function ProfilePage() {
	const navigator = useNavigate();
	const [searchParams] = useSearchParams();
	const [profile_state, setProfile] = useState<ProfileSkeleton>();
	const [loading_state, setLoadingState] = useState<ProfilePageLoadingState>(DEFAULT_LOADING_STATE);
	//const changeProfile = useStateUtil(setProfile);
	const setLoading = useStateUtil(setLoadingState);
	const uid = searchParams.get('uid');

	useEffect(() => {
		if (!uid) {
			setProfile(profileobj.serialize());
			sync(profileobj.serialize());

			const i = profileobj.on('onUpdates', (arg) => {
				const serialized = profileobj.serialize();
				setProfile(serialized);
				sync(serialized);
				//check if offline
			});
			return () => {
				if (i) {
					profileobj.off('onUpdates', i);
				}
			};
		} else {
			//handle the case wherdasde we are given a uid
			APIMethods.refreshIfFailed(() => APIMethods.getProfile(uid))
				.then((profile) => {
					if (!profile) {
						//navigator('/');
						return;
					}
					setProfile({ ...profile });
					sync(profile);

				}).catch((e) => {
					Log.log(e, 1, 'ProfilePage');
					//navigator('/');
					//
				});


			return (() => {
				setProfile(undefined);
			});
		};
	}, [uid]);

	useEffect(() => {

	}, [profile_state]);



	async function sync(pfState?: ProfileSkeleton) {
		if (pfState && !Authentication.getOfflineMode()) {
			/* get the followers */
			let res = await APIMethods.refreshIfFailed(() => APIMethods.getFollowers(pfState.id))
			setLoading('followers', { loading: false, value: res.length });
			/* get the following */
			res = await APIMethods.refreshIfFailed(() => APIMethods.getFollowing(pfState.id))
			setLoading('following', { loading: false, value: res.length });
			res = await APIMethods.getPosts(pfState.id).finally(() => {
				setLoading('skills', { loading: false, value: pfState.skills.length });
			});
			setLoading('feed', { loading: false, value: res.posts });

			/* get the skills */


		} else {
			setLoading('skills', { loading: false, value: pfState.skills.length });
			setLoading('followers', { loading: false, value: -1 });
			setLoading('following', { loading: false, value: -1 });
			setLoading('feed', { loading: false, value: [] });
		}
	}

	if (!profile_state) {
		return <main>Loading...</main>;
	}

	return (
		<main style={{ maxWidth: '896px', width: '896px' }}>
			<ProductDetailCard profile_obj={profile_state} editable={!uid || uid === `${profileobj.Id}`} setProfile={setLoading} extraData={loading_state} />
			<div className="profile-page__content">
				<div className="profile-page__content__section">
					<div className={`profile-page__content__section__box one card ${loading_state.followers.loading && 'loading'}`}>
						<span>Skills</span>
						<h2>{loading_state.skills.value ?? ''}</h2>
					</div>
					<div className={`profile-page__content__section__box one card ${loading_state.followers.loading && 'loading'}`}>
						<span>Followers</span>
						<h2>{loading_state.followers.value ?? ''}</h2>
					</div>
					<div className={`profile-page__content__section__box one card ${loading_state.followers.loading && 'loading'}`}>
						<span>Following</span>
						<h2>{loading_state.following.value ?? ''}</h2>
					</div>
				</div>
				<div className="profile-page__content__section">
					<ProfileTopSkillCard profile_obj={profile_state} setProfile={setLoading} extraData={loading_state} />
					<ProfileSkillCard skills={profile_state.skills ?? []} setProfile={setLoading} extraData={loading_state} />
				</div>
				<div className="profile-page__content__section">
					<ProfileFeedCard profile_obj={profile_state} setProfile={setLoading} extraData={loading_state} />
				</div>
			</div>
		</main>
	);
}

export default ProfilePage;
