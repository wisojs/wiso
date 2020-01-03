import { Factory } from '.';
import { NormalizeMetaData } from '@wisojs/common';

export interface ServerRules {
  controllers: any[]
}

export type ServerInitializer<T, C> = (factory: Factory, model: T, configs: C) => void;

export function Server<T = any, C = any, R = {}>(
  callback: (options: {
    factory: Factory,
    rules: R,
    target: T,
    configs: C
  }) => void
) {
  return (rules: R): ClassDecorator => {
    return (target) => {
      const meta = NormalizeMetaData.bind(target);
      meta.set(
        'initialize', 
        (factory: Factory, model: T, configs: C) => callback({
          factory, rules,
          target: model,
          configs: configs
        })
      );
    }
  }
}