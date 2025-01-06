import { APITypes } from "../api/api";

/**
 * @name History
 * @namespace History
 * @description this namespace contains functions to work with history objects
 * @warning this namespace is not meant to be used with online data, this is for offline data only; this is not a replacement for the API when it comes to the online mode
 * I particularly don't want the API to send huge amounts of data to the client, so the API will do all the calculations and send the result to the client
 */
export namespace History {
	type HistoryBase = APITypes.HistoryBase;
	type HistoryProject = APITypes.HistoryProfile;
	type HistorySkill = APITypes.HistorySkill;

	/* mulitplier factors */
	export enum Time {
		Seconds = 1,
		Minutes = 60,
		Hours = 3600,
		Days = 86400,
		Weeks = 604800,
		Months = 2592000,
		Years = 31536000,
	}


	/* skill */
	export namespace Skill {

		export type SkillHistory = {
			goalsCompleted: number;
			goalsIncremented: number;
			totalXP: number;
			totalLevels: number;
			/* more abstract things */
			mostActiveGoal: number; //id
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
				timeframe: (seconds: number) => {
					return { ...aggregate(timeframe(history, seconds)) };
				},
				...(history.length > 0 ? { ...history[0] } : {})
			}
		}

		/**
		 * @name timeframe 
		 * @description	this function filters the history of a skill by a certain timeframe (in seconds)
		 * @param {HistorySkill[]} history the history object
		 * @param {number} seconds the number of seconds to filter by
		 * @returns {HistorySkill[]} the filtered history
		 */
		function timeframe(history: HistorySkill[], seconds: number): HistorySkill[] {
			const now = new Date();
			const cutoff = new Date(now.getTime() - seconds * 1000);

			return history.filter(h => {
				return new Date(h.created_at) >= cutoff;
			})
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
			let goalsIncremented = 0;
			let mostActiveGoal = 0;
			let mostActiveGoalCount: { [key: number]: number } = {

			}


			for (const h of history) {
				switch (h.type) {
					case 'goal-increment':
						mostActiveGoalCount[h.goal_id] = mostActiveGoalCount[h.goal_id] ? mostActiveGoalCount[h.goal_id] + 1 : 1;
						goalsIncremented++;
						totalXP += h.xp;
						totalLevels += h.level;
						break;
					case 'goal-decrement':
						mostActiveGoalCount[h.goal_id] = mostActiveGoalCount[h.goal_id] ? mostActiveGoalCount[h.goal_id] - 1 : -1;
						goalsIncremented--;
						totalXP -= h.xp;
						totalLevels += h.level; //could be negative
						break;
					case 'goal-complete':
						mostActiveGoalCount[h.goal_id] = mostActiveGoalCount[h.goal_id] ? mostActiveGoalCount[h.goal_id] + 1 : 1;
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

			mostActiveGoal = Object.keys(mostActiveGoalCount).reduce((a, b) => {
				return mostActiveGoalCount[a] > mostActiveGoalCount[b] ? a : parseInt(b);
			}, 0);

			goalsCompleted = Math.max(goalsCompleted, 0);
			totalXP = Math.floor(totalXP * 100) / 100;

			return {
				goalsCompleted,
				goalsIncremented,
				mostActiveGoal,
				totalXP,
				totalLevels,
			}
		}

		////////////////////////////////////
		//Functions to pick the best skill//
		////////////////////////////////////

		/**
		 * @name bestSkill
		 * @description this function picks the best skill from a list of skills
		 * @param {HistorySkill[][]} skills the list of skills
		 */
		export function bestSkill(skills: HistorySkill[][]) {
			const bSkills = skills.reduce((a, b) => {
				return best(a, b);
			});
			return create(bSkills);
		}

		/**
		 * @name best
		 * @description this function picks the best skill from two skills
		 * @param {HistorySkill[]} a
		 * @param {HistorySkill[]} b
		 * @returns {HistorySkill}
		 */
		function best(a: HistorySkill[], b: HistorySkill[]): HistorySkill[] {
			const aAgg = aggregate(a);
			const bAgg = aggregate(b);

			const factors = {
				goalsCompleted: 10,
				totalXP: 0.4,
				totalLevels: 2,
				goalsIncremented: 2,
			}

			const score = (agg: SkillHistory) => agg.goalsCompleted * factors.goalsCompleted + agg.totalXP * factors.totalXP + agg.totalLevels * factors.totalLevels + agg.goalsIncremented * factors.goalsIncremented;
			const aScore = score(aAgg);
			const bScore = score(bAgg);
			//console.log({ aAgg, aScore }, { bAgg, bScore });

			if (aScore > bScore) return a;
			if (bScore > aScore) return b;
			return a;
		}


	}

}
