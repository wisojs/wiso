import 'reflect-metadata';

export type ParameterMetaDataStack<T = {}> = (ctx: T, ...args: any[]) => any | Promise<any>;

export class ParameterMetaData<T = {}> {
  static namespace = 'metadata.parameterMetaData.space';
  private readonly stacks: ParameterMetaDataStack<T>[] = [];

  get size() {
    return this.stacks.length;
  }

  set(index: number, callback: ParameterMetaDataStack<T>) {
    this.stacks[index] = callback;
    return this;
  }

  get<U = any>(index: number, ctx?: T, ...args: any[]) {
    if (typeof this.stacks[index] !== 'function') return;
    return this.stacks[index](ctx, ...args) as U | Promise<U>;
  }

  exec(ctx: T) {
    return Promise.all(this.stacks.map(fn => {
      if (typeof fn === 'function') return Promise.resolve(fn(ctx));
      return Promise.resolve();
    }));
  }

  static bind(target: Object) {
    let meta: ParameterMetaData;
    if (!Reflect.hasMetadata(ParameterMetaData.namespace, target)) {
      meta = new ParameterMetaData();
      Reflect.defineMetadata(ParameterMetaData.namespace, meta, target);
    } else {
      meta = Reflect.getMetadata(ParameterMetaData.namespace, target) as ParameterMetaData;
    }
    return meta;
  }

  static setWithoutArguments<T = {}>(callback: ParameterMetaDataStack<T>): ParameterDecorator {
    return (target, property, index) => {
      const clazz = target.constructor.prototype[property];
      if (!clazz) return;
      const meta = ParameterMetaData.bind(clazz);
      meta.set(index, callback);
    }
  }

  static setWithArguments<T>(callback: ParameterMetaDataStack<T>) {
    return (...args: any[]): ParameterDecorator => {
      return (target, property, index) => {
        const clazz = target.constructor.prototype[property];
        if (!clazz) return;
        const meta = ParameterMetaData.bind(clazz);
        meta.set(index, (ctx: T) => callback(ctx, ...args));
      }
    }
  }
}