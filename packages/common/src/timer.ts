const Timers = new Set<Timer<'setTimeout' | 'setInterval'>>();

export class Timer<T extends 'setTimeout' | 'setInterval'> {
  private readonly name: T;
  private readonly context: NodeJS.Timer;

  constructor(
    name: T, 
    callback: (...args: any[]) => void,
    timeout: number,
    ...args: any[]
  ) {
    switch (this.name = name) {
      case 'setTimeout': this.context = setTimeout(callback, timeout, ...args); break;
      case 'setInterval': this.context = setInterval(callback, timeout, ...args); break;
      default: throw new Error('no support timer type of ' + name);
    }
  }

  stop() {
    if (!this.context) return;
    switch(this.name) {
      case 'setTimeout': clearTimeout(this.context); break;
      case 'setInterval': clearInterval(this.context); break;
    }
  }

  static setTimeout(callback: (...args: any[]) => void, timeout?: number, ...args: any[]) {
    const timer = new Timer<'setTimeout'>('setTimeout', (...args: any[]) => {
      if (Timers.has(timer)) Timers.delete(timer);
      callback(...args);
    }, timeout, ...args);
    Timers.add(timer);
    return timer;
  }

  static clearTimeout(timer: Timer<'setTimeout'>) {
    timer.stop();
    if (Timers.has(timer)) Timers.delete(timer);
  }

  static setInterval(callback: (...args: any[]) => void, timeout?: number, ...args: any[]) {
    const timer = new Timer<'setInterval'>('setInterval', callback, timeout, ...args);
    Timers.add(timer);
    return timer;
  }

  static clearInterval(timer: Timer<'setInterval'>) {
    timer.stop();
    if (Timers.has(timer)) Timers.delete(timer);
  }

  static destroy() {
    for (const timer of Timers.values()) {
      timer.stop();
      Timers.delete(timer);
    }
  }
}