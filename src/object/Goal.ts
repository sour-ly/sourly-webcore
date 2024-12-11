import { Eventful } from '../event/events';

type EventMap = {
  goalProgressChanged: {
    goal: Goal;
    amount: number;
    revertCompletion?: boolean;
  };
  goalProgressChangedFinal: { amount: number; goal: Goal };
  completed: Goal;
};

export type GoalEventMap = EventMap;

export type GoalProps = {
  id?: string;
  name?: string;
  description?: string;
  progress?: number;
  metric?: string;
  target?: number;
  reward?: number;
  completed?: boolean;
};

export default class Goal extends Eventful<EventMap> {
  private completed: boolean = false;

  constructor(
    private name: string = 'Untitled',
    private description: string = 'No description',
    private progress: number = 0,
    private reward: number = 1,
    private metric: string = 'units',
    private target: number = 1,
    completed: boolean = false,
  ) {
    super();
    this.completed = completed;
  }

  public async incrementProgress(amount: number = 1) {
    const p = new Promise((resolve) => {
      const fn = () => {
        if (this.completed) return;
        this.progress += amount;
        if (this.progress >= this.target) {
          this.completed = true;
          this.emit('completed', this);
        }
        resolve(true);
      }
      this.emit('goalProgressChanged', { goal: this, amount }, fn);
    });
    return await p;
  }

  public undo() {
    if (this.progress <= 0) return;
    if (this.completed) {
      this.completed = false;
      this.emit('goalProgressChanged', {
        goal: this,
        amount: -1,
        revertCompletion: true,
      });
    } else {
      this.emit('goalProgressChanged', { goal: this, amount: -1 });
    }
    this.progress--;
  }

  public get Name() {
    return this.name;
  }

  public get Description() {
    return this.description;
  }

  public get Progress() {
    return this.progress;
  }

  public set Progress(value: number) {
    this.progress = value;
  }

  public get Current() {
    return this.progress;
  }

  public get Completed() {
    return this.completed;
  }

  public set Completed(value: boolean) {
    this.completed = value;
  }

  public get Metric() {
    return this.metric;
  }

  public get Target() {
    return this.target;
  }

  public get Reward() {
    return this.reward;
  }

  /* Searialization */
  public toJSON() {
    return {
      id: `${this.Id}`,
      name: this.name,
      description: this.description,
      progress: this.progress,
      metric: this.metric,
      reward: this.reward,
      target: this.target,
      completed: this.completed,
    };
  }
}
