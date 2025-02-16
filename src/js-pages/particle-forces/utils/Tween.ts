import { globalState } from './globalState';
import { polynomialEase2, polynomialEase4 } from './customEasings';
import { Vec3 } from '../lib/math/Vec3';

export const EasingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  polynomialEase2,
  polynomialEase4,
  sinusoidalInOut: (t: number) => 0.5 * (1 - Math.cos(Math.PI * t)),
};

interface TweenProperties {
  [key: string]: number | number[];
}

export class Tween {
  id;
  tasks: TweenTask[] = [];
  duration = 3000;
  easing: (t: number) => number = EasingFunctions.polynomialEase2;
  startTimestamp: null | number = null;
  actualStartTimestamp: null | number = null;
  completed = false;
  onUpdateFn: ((objs: any) => void) | null = null;
  onCompleteFn: (() => void) | null = null;
  delay = 0;

  constructor(id: string, duration: number | null = null) {
    this.id = id;
    if (duration !== null) {
      this.setDuration(duration);
    }
    globalState.tweenManager.addTween(this);
  }

  addTask(obj: TweenProperties | Vec3) {
    const task = new TweenTask(obj as TweenProperties, this);
    this.tasks.push(task);
    return task;
  }

  setDelay(delay: number) {
    this.delay = delay;
    return this;
  }

  stop() {
    this.completed = true;
    globalState.tweenManager.removeTween(this);
  }

  onUpdate(fn: (objs: any) => void) {
    this.onUpdateFn = fn;
  }

  onComplete(fn: () => void) {
    this.onCompleteFn = fn;
  }

  setDuration(duration: number) {
    this.duration = duration;
    return this;
  }

  setEasing(easing: (t: number) => number) {
    this.easing = easing;
    return this;
  }

  start() {
    this.tasks.forEach((task) => task.createInitObj());
    this.startTimestamp = performance.now();
    this.actualStartTimestamp = this.startTimestamp + this.delay;
    return this;
  }

  update() {
    if (this.startTimestamp === null || this.actualStartTimestamp === null || this.completed) return;

    const now = performance.now();

    if (now < this.actualStartTimestamp) return;

    const timeElapsed = now - this.actualStartTimestamp;
    const progress = Math.min(timeElapsed / this.duration, 1);
    const easingFunc = this.easing;
    const progressEased = easingFunc(progress);
    const objs: any = [];
    this.tasks.forEach((task) => {
      const obj = task.update(progressEased);
      objs.push(obj);
    });
    this.onUpdateFn && this.onUpdateFn(objs);

    if (progress >= 1) {
      this.stop();
      this.onCompleteFn && this.onCompleteFn();
    }
  }
}

class TweenTask {
  parentTween: Tween;
  obj: TweenProperties = {};
  target: TweenProperties = {};
  initial: TweenProperties = {}; // Used for storing initial values of this.obj that are in this.target

  constructor(obj: TweenProperties, parentTween: Tween) {
    this.obj = obj;
    this.parentTween = parentTween;
  }

  to(target: TweenProperties | Vec3) {
    this.target = target as TweenProperties;
  }

  // Will create an init obj but just for the keys that are in target
  createInitObj() {
    for (const key in this.target) {
      if (this.target.hasOwnProperty(key)) {
        const targetValue = this.target[key];
        const objValue = this.obj[key];

        const isArray = Array.isArray(targetValue) && Array.isArray(objValue);
        const isNumber = typeof targetValue === 'number' && typeof objValue === 'number';
        if (isArray) {
          // Deep copy for arrays, can use JSON.parse(JSON.stringify()) for this since it's a number array only
          this.initial[key] = JSON.parse(JSON.stringify(this.obj[key]));
        } else if (isNumber) {
          // Copy number
          this.initial[key] = this.obj[key];
        } else {
          // Stop parent tween and log error
          globalState.tweenManager.removeTween(this.parentTween);
          console.error(
            `Error TweenId: ${this.parentTween.id} when creating initObj. Was expecting number or array of numbers`,
          );
        }
      }
    }
  }

  update(progressEased: number) {
    for (const key in this.target) {
      if (this.target.hasOwnProperty(key)) {
        const targetValue = this.target[key];
        const initialValue = this.initial[key];

        const isArray = Array.isArray(targetValue) && Array.isArray(initialValue);
        const isNumber = typeof targetValue === 'number' && typeof initialValue === 'number';

        if (isNumber) {
          const change = targetValue - initialValue;
          const value = initialValue + change * progressEased;
          this.obj[key] = value;
        } else if (isArray) {
          const value = [];
          for (let i = 0; i < targetValue.length; i++) {
            const initial = initialValue[i];
            const target = targetValue[i];
            const change = target - initial;
            value.push(initial + change * progressEased);
          }
          this.obj[key] = value;
        } else {
          // Stop parent tween and log error
          globalState.tweenManager.removeTween(this.parentTween);
          console.error(
            `Error TweenId: ${this.parentTween.id} when updating tween. Was expecting number or array of numbers`,
          );
        }
      }
    }

    return this.obj;
  }
}

export class TweenManager {
  tweens: Tween[];

  constructor() {
    this.tweens = [];
  }

  addTween(tween: Tween) {
    // Check if tween with same id already exists, if so, stop it (it will be removed as well)
    const existingTween = this.tweens.find((t) => t.id === tween.id);
    if (existingTween) {
      existingTween.stop();
    }
    this.tweens.push(tween);
  }

  removeTween(tween: Tween) {
    this.tweens = this.tweens.filter((t) => t.id !== tween.id);
  }

  findTween(id: string) {
    return this.tweens.find((t) => t.id === id);
  }

  update() {
    this.tweens.forEach((tween) => tween.update());
  }
}
