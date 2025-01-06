import { useEffect, useState } from "react";
import { ProfileSkeleton } from "../../object/Profile";
import { ProfilePageModifyState } from "../../views/Profile";
import ProgressBar from "../ProgressBar";
import '../styles/profile/profiletopskill.scss';
import Skill, { SkillProps } from "../../object/Skill";
import { History } from "../../history/history";
import { APIMethods, APITypes } from "../../api/api";
import toRomanNumerals from "../../util/roman";

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

function StatCard({ title, value }: { title: string, value: string | number }) {
	return (
		<div className="profile-top-skill-card__stats__stat card">
			<h2>{title}</h2>
			<span>{value}</span>
		</div>
	)
}

export function ProfileTopSkillCard({ profile_obj, setProfile, extraData }: ProfileTopSkillCard) {

	const [bestSkill, setBestSkill] = useState<{ skill: SkillProps, history: History.Skill.SkillHistory }>();

	useEffect(() => {
		if (!profile_obj) return;
		const skills = getSkills().filter(s => s.hidden == false);
		if (skills.length === 0) return;
		getHistory(skills).then(history => {
			const bSkill = History.Skill.bestSkill(history);
			const skill = skills.find(s => parseInt(s.id as string) === bSkill.skill_id);
			setBestSkill({ skill: skill, history: bSkill.timeframe(History.Time.Days * 7) });
		});
	}, [profile_obj]);

	useEffect(() => {
		if (!bestSkill) return;
		//console.log(bestSkill);
	}, [bestSkill]);

	async function getHistory(skills: SkillProps[]) {
		let history: APITypes.HistorySkill[][] = [];
		for (const skill of skills) {
			const historyobj = await APIMethods.refreshIfFailed(() => APIMethods.getSkillHistory(skill.id as number, -1, 7 * History.Time.Days));
			history.push(historyobj);
		}
		return history;
	}

	function getSkills() {
		if (!profile_obj) return;
		return profile_obj.skills
	}

	if (!bestSkill) return (
		<div className="profile-top-skill-card profile-page__content__section__box card loading">
			<span>Top Skill</span>
			<h2>Loading...</h2>
		</div>
	);

	if (!bestSkill.skill) return (
		<div className="profile-top-skill-card profile-page__content__section__box card">
			<span>Top Skill</span>
			<p className="error">Sorry, we don't have any data yet!</p>
		</div>
	);

	return (
		<div className="profile-top-skill-card profile-page__content__section__box card">
			<span>Top Skill</span>
			<h2>{bestSkill.skill.name} {toRomanNumerals(bestSkill.skill.level)}</h2>
			<div className="profile-top-skill-card__stats scrollbar">
				<SkillXPCard xp={bestSkill.skill.currentExperience} maxXp={Skill.calculateExperienceRequired(bestSkill.skill.level)} />
				<StatCard title="Goals Completed in the last 7 days" value={bestSkill.history.goalsCompleted} />
				<StatCard title="XP Earned in the last 7 days" value={bestSkill.history.totalXP + ' XP'} />
				<StatCard title="Levels Gained in the last 7 days" value={bestSkill.history.totalLevels} />
				<StatCard title="Goals Incremented in the last 7 days" value={bestSkill.history.goalsIncremented} />
				<StatCard title="Most Active Goal" value={bestSkill.skill.goals.find(o => parseInt(o.id as string) === bestSkill.history.mostActiveGoal)?.name ?? `ID : ${bestSkill.history.mostActiveGoal}`} />
			</div>
		</div>
	);
}
