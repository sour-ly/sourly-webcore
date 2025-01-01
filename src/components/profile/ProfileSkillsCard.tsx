import { ProfileSkeleton } from "../../object/Profile";
import { ProfilePageModifyState } from "../../views/Profile";
import '../styles/profile/profileskill.scss';

type ProfileSkillCard = {
	profile_obj: ProfileSkeleton;
} & ProfilePageModifyState;

export function ProfileSkillCard({ profile_obj, setProfile, extraData }: ProfileTopSkillCard) {
	return (
		<div className="profile-skill-card profile-page__content__section__box card">
			<span>Skills</span>

		</div>
	);
}
