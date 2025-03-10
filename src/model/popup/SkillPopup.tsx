import {
	ButtonHTMLAttributes,
	DetailedHTMLProps,
	useEffect,
	useState,
} from 'react';
// import Goal, { GoalProps } from "../../../model/Goal";
import Skill, { SkillManager, SkillProps } from '../../object/Skill';
//import Plus from '../../../../assets/ui/plus.svg';
import { useWindow } from '../../App';
import { useStateUtil } from '../../util/state';
import Input from '../../components/Input';
import { ButtonProps } from '../../popup/Popup';
import { assets, profileobj } from '../..';
import { WelcomePageSlideTwoContext } from '../../messagescreen/pages/WelcomePage';
import { Button } from '../../components/Button';


export function SkillPopupWrapper({
	tskill,
	edit,
	...props
}: { tskill: SkillProps; edit?: boolean } & ButtonProps) {
	const [skill, setSkill] = useState<SkillProps>({ ...tskill });
	const change = useStateUtil(setSkill);
	const ctx = useWindow();
	const Plus = assets.getAsset('ui/plus');

	function saveSkill() {
		setSkill((o) => {
			if (edit) {
				if (profileobj.updateSkill(Number(tskill.id ?? -1), { ...o }))
					ctx.notification.notify(
						`Skill "${tskill.name}" is now "${o.name}" !`,
					);
			} else {
				(async () => {
					const r = await profileobj.addSkill(new Skill(o.name));
					if (r) ctx.notification.notify(`Skill ${o.name} created!`);
				})();
			}
			return o;
		});
	}

	function addSkillPopUp() {
		props.onClick && props.onClick();
		ctx.popUp.open({
			type: 'save',
			title: (edit && 'Edit Skill') || 'Add Skill',
			content: () => (
				<div className="add_skill_popup">
					<Input
						placeholder="Name"
						onChange={(e) => change('name', e.currentTarget.value)}
						value={skill.name}
					/>
					<Input
						type="checkbox"
						placeholder="Hide Skill from public? "
						onChange={(e) => { change('hidden', e.currentTarget.checked ?? false) }}
						value={skill.hidden}
					/>

				</div>
			),
			options: {
				onOkay: () => {
					saveSkill();
					ctx.popUp.close();
				},
				onCancel: () => {
					ctx.popUp.close();
				},
			},
		});
	}

	return (
		(edit && (
			<button className="add_skill" onClick={addSkillPopUp}>
				{(edit && 'Edit') || 'Add'} Skill
			</button>
		)) || (
			<Button onClick={addSkillPopUp} type="outline">
				<img src={Plus} alt="plus" />{' '}
				<span>{(edit && 'Edit') || 'Add'} Skill</span>
			</Button>
		)
	);
}

export function SkillDeletePopUp({
	skill,
	...props
}: { skill: Skill } & ButtonProps) {
	const ctx = useWindow();

	function deleteSkillPopUp() {
		props.onClick && props.onClick();
		ctx.popUp.open({
			type: 'confirm',
			title: 'Are you sure?',
			content: () => (
				<div>
					<p>Are you sure you want to delete this skill?</p>
				</div>
			),
			options: {
				onOkay: () => {
					profileobj.removeSkill(skill);
					ctx.popUp.close();
				},
				onCancel: () => {
					ctx.popUp.close();
				},
			},
		});
	}

	return (
		<button
			{...props}
			className={`delete_skill ${props.className}`}
			onClick={deleteSkillPopUp}
		>
			Delete Skill
		</button>
	);
}

/* I know this isnt a popup but its close enough */

export function SkillHelpMenu(
	props: DetailedHTMLProps<
		ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	>,
) {
	const ctx = useWindow();

	function helpMenu() {
		ctx.msgScreen.open(WelcomePageSlideTwoContext);
	}

	return (
		<button
			{...props}
			className={`help_skill ${props.className}`}
			onClick={helpMenu}
		>
			Help
		</button>
	);
}
