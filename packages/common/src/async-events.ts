/**
 * Async events emitter class
 * @author evio shen
 * @email evio@vip.qq.com
 * @version 1.0.0
 * @example <typescript>
 *  type LocalEventsType = {
 *    setup: [number, string],
 *    exit: [{ a: string, b: number }]
 *  }
 * 
 *  const obj = new AsyncEventEmitter();
 *  obj.on('setup', (a, b) => {
 *    // now a is number and b is string
 *  });
 *  obj.on('exit', params => {
 *    // now params.a is string and params.b is number
 *  });
 *  await obj.emit('setup', '123', 456);
 *  await obj.emit('exit', { a: 123, b: '456' });
 */
export class AsyncEventEmitter<T extends { [key: string]: any[] }> {
  private stacks: Map<keyof T, Set<(...args: T[keyof T]) => void | Promise<void>>> = new Map();

  has(name: keyof T) {
    return this.stacks.has(name);
  }

  count(name: keyof T) {
    return this.has(name) ? this.stacks.get(name).size : 0;
  }

  get size() {
    return this.stacks.size;
  }

  on<U extends keyof T>(name: U, callback: (...args: T[U]) => void | Promise<void>) {
    let stack: Set<(...args: T[U]) => void | Promise<void>>;
    if (!this.stacks.has(name)) {
      stack = new Set();
      this.stacks.set(name, stack);
    }
    stack.add(callback);
  }

  off<U extends keyof T>(name: U, callback?: (...args: T[U]) => void | Promise<void>) {
    if (!this.stacks.has(name)) return;
    if (!callback) {
      this.stacks.delete(name);
      return;
    }
    const stack = this.stacks.get(name);
    if (!stack.has(callback)) return;
    stack.delete(callback);
  }

  async emit<U extends keyof T>(name: U, ...args: T[U]) {
    if (!this.count(name)) return;
    await Promise.all(
      Array.from(
        this.stacks
        .get(name).values()
      ).map(callback => Promise.resolve(callback(...args)))
    );
  }
}