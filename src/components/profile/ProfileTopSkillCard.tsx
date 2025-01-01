import { ProfileSkeleton } from "../../object/Profile";
import { ProfilePageModifyState } from "../../views/Profile";
import ProgressBar from "../ProgressBar";
import '../styles/profile/profiletopskill.scss';

type ProfileTopSkillCard = {
	profile_obj: ProfileSkeleton;
} & ProfilePageModifyState;


function SkillXPCard({ xp, maxXp }: { xp: number, maxXp: number }) {
	return (
		<div className="profile-top-skill-card__stats__stat xp card">
			<span>{xp} XP / {maxXp} XP</span>
			<ProgressBar
				type="normal"
				max={maxXp}
				value={xp}
			/>
		</div>
	)
}

function StatCard({ title, value }: { title: string, value: number }) {
	return (
		<div className="profile-top-skill-card__stats__stat card">
			<h2>{title}</h2>
			<span>{value}</span>
		</div>
	)
}

export function ProfileTopSkillCard({ profile_obj, setProfile, extraData }: ProfileTopSkillCard) {
	return (
		<div className="profile-top-skill-card profile-page__content__section__box card">
			<span>Top Skill</span>
			<h2>Pottery I</h2>
			<div className="profile-top-skill-card__stats scrollbar">
				<SkillXPCard xp={75} maxXp={120} />
				<StatCard title="Goals Completed in the last 7 days" value={4} />
				<StatCard title="Goals Completed in the last 7 days" value={4} />
				<StatCard title="Goals Completed in the last 7 days" value={4} />
				<StatCard title="Goals Completed in the last 7 days" value={4} />
				<StatCard title="Goals Completed in the last 7 days" value={4} />
				<StatCard title="Goals Completed in the last 7 days" value={4} />
				<StatCard title="Goals Completed in the last 7 days" value={4} />
			</div>
		</div>
	);
}
