import { useEffect, useState } from 'react';
import Skill, { SkillManager } from '../object/Skill';
import { SkillPopupWrapper } from '../model/popup/SkillPopup';
import { SkillView } from '../model/SkillView';
import { profileobj } from '..';

function Home() {
	const [skills, setSkills] = useState<Skill[]>(profileobj?.Skills ?? []);

	useEffect(() => {
		const i = profileobj.on('onUpdates', (skill) => {
			console.log('updating skills', skill);
			setSkills((_) => {
				return [...skill.skills];
			});
		});
		return () => {
			profileobj.off('onUpdates', i);
		};
	}, []);

	return (
		<main className="home">
			{skills.length === 0 && <h1>No Skills Yet!</h1>}
			{skills.map((skill) => {
				return <SkillView key={skill.uid} skill={skill} skills={skills} />;
			})}
			<SkillPopupWrapper tskill={{}} edit={false} />
		</main>
	);
}

export default Home;
