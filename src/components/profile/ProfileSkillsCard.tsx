import { SkillView } from "../../model/SkillView";
import { Profile, ProfileSkeleton } from "../../object/Profile";
import Skill, { SkillProps } from "../../object/Skill";
import { ProfilePageModifyState } from "../../views/Profile";
import '../styles/profile/profileskill.scss';

type ProfileSkillCard = {
	skills: SkillProps[];
} & ProfilePageModifyState;

export function ProfileSkillCard({ skills, setProfile, extraData }: ProfileSkillCard) {
	return (
		<div className="profile-skill-card profile-page__content__section__box card">
			<span>Skills</span>
			<div className="profile-skill-card__skills scrollbar">
				{
					(!skills &&
						<h2>This user has no public skills.</h2>)
					||
					skills.map((skill) => (
						<SkillView skill={Profile.castSkillFromJSON(skill)} skills={[]} staticView={true} />
					))}
			</div>
		</div>
	);
}
