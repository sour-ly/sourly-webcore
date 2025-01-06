import './styles/goalview.scss';
import Goal from '../object/Goal';
import ProgressBar from '../components/ProgressBar';
import { useWindow } from '../App';
import { GoalDeletePopUp, GoalPopUpWrapper } from './popup/GoalPopup';
import OptionDropdown, { Options } from '../components/OptionDropdown';
import { profileobj } from '..';
import { absorb } from '../util/click';

export default function GoalView({
	goal,
	skill_id,
	staticView = false,
}: {
	goal: Goal;
	skill_id: number;
	staticView?: boolean;
}) {
	const goalpop = GoalPopUpWrapper({
		goalt: goal,
		skill: profileobj.getSkillById(skill_id),
	});

	const options = [
		{
			key: 'undo',
			value: 'Undo Goal',
			onClick: () => goal.incrementProgress(-1),
		},
		{ key: 'edit', element: goalpop },
		{
			key: 'delete',
			element: (
				<GoalDeletePopUp
					goal={goal}
					skill={profileobj.getSkillById(skill_id)}
				/>
			),
		},
	] as Options;

	function divClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		absorb(e);
		if (staticView) return;
		goal.incrementProgress(1);
	}

	return (
		<div
			className={`goalview ${goal.Completed && 'done'} card`}
			onClick={divClick}
		>
			<div className="goalview__title">
				<h2>{goal.Name} </h2>
				{!staticView &&
					<OptionDropdown options={options} />
				}
			</div>
			<p>
				{goal.Description.trim().length === 0
					? 'No Description'
					: goal.Description}
			</p>
			<ProgressBar max={goal.Target} value={goal.Current} />
			<div className="goalview__footer">
				{goal.Completed ? (
					<p>Completed</p>
				) : (
					<p>
						{goal.Current} / {goal.Target} {goal.Metric}
					</p>
				)}
			</div>
		</div>
	);
}
