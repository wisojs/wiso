  
import 'reflect-metadata';

export class NormalizeMetaData {
  static namespace = Symbol('metadata.normalizeMetaData.space');
  private readonly stacks: Map<string, any> = new Map();
  
  set(key: string, value: any) {
    this.stacks.set(key, value);
    return this;
  }

  get<T = any>(key: string) {
    return this.stacks.get(key) as T;
  }

  get size() {
    return this.stacks.size;
  }

  has(key: string) {
    return this.stacks.has(key);
  }

  static bind(target: Object) {
    let meta: NormalizeMetaData;
    if (!Reflect.hasMetadata(NormalizeMetaData.namespace, target)) {
      meta = new NormalizeMetaData();
      Reflect.defineMetadata(NormalizeMetaData.namespace, meta, target);
    } else {
      meta = Reflect.getMetadata(NormalizeMetaData.namespace, target) as NormalizeMetaData;
    }
    return meta;
  }

  static setValue(key: string, value: any): MethodDecorator | ClassDecorator {
    return (target, property, descriptor) => {
      const meta = NormalizeMetaData.bind(!property && !descriptor ? target : descriptor.value);
      meta.set(key, value);
    }
  }

  static setFunction(key: string, callback: (...args: any[]) => any) {
    return (...args: any[]): MethodDecorator | ClassDecorator => {
      return (target, property, descriptor) => {
        const meta = NormalizeMetaData.bind(!property && !descriptor ? target : descriptor.value);
        const value = meta.get(key);
        meta.set(key, callback(value, ...args));
      }
    }
  }
  
  static setArray(key: string, ...args: any[]): MethodDecorator | ClassDecorator  {
    return (target, property, descriptor) => {
      const meta = NormalizeMetaData.bind(!property && !descriptor ? target : descriptor.value);
      const value: any[] = meta.get(key) || [];
      if (!Array.isArray(value)) throw new TypeError('cannot push indefined value as an array');
      if (!value.length) meta.set(key, value);
      value.push(...args);
    }
  }
}