import { APITypes } from "../api/api";

export namespace History {
	type HistoryBase = APITypes.HistoryBase;
	type HistoryProject = APITypes.HistoryProfile;
	type HistorySkill = APITypes.HistorySkill;



	/* skill */
	export namespace Skill {

		type SkillHistory = {
			goalsCompleted: number;
			totalXP: number;
			totalLevels: number;
		}

		/**
		 * @name create
		 * @description this function creates a skill history object, mainly something with data and methods
		 * @param {HistorySkill} history the history object
		 */
		export function create(history: HistorySkill[]) {

			return {
				aggregate: () => {
					return { ...aggregate(history), ...this };
				},
			}
		}

		/**
		 * @name aggregate
		 * @description this function aggregates the history of a skill into a single object
		 * @param {HistorySkill}
		 * @returns {SkillHistory}
		 */
		function aggregate(history: HistorySkill[]): SkillHistory {
			let goalsCompleted = 0;
			let totalXP = 0;
			let totalLevels = 0;

			for (const h of history) {
				switch (h.type) {
					case 'goal-increment':
						totalXP += h.xp;
						totalLevels += h.level;
						break;
					case 'goal-decrement':
						totalXP -= h.xp;
						totalLevels += h.level; //could be negative
						break;
					case 'goal-complete':
						goalsCompleted++;
						totalXP += h.xp;
						totalLevels += h.level;
						break;
					case 'level-up':
						totalXP += h.xp;
						totalLevels += h.level;
						break;
					default:
						break;
				}
			}

			goalsCompleted = Math.max(goalsCompleted, 0);
			totalXP = Math.floor(totalXP * 100) / 100;

			return {
				goalsCompleted,
				totalXP,
				totalLevels,
			}
		}


	}

}
