import { Factory } from './factory';
import { CustomError, NormalizeMetaData, Transaction }  from '@wisojs/common';

export type ServerExtendtion<T = {}, U = any, M = any, R = {}> = { 
  moduleConstructor: { new(factory: Factory, options: T): M }, 
  module: M,
  options: T, 
  exports: U,
  rules: R
}

export class ServerContext<T extends ServerExtendtion> {
  private _locked = false;
  private readonly _rules: T['rules'];
  private _module: T['module'];
  private _options: T['options'];
  private _factory: Factory;
  private _exports: T['exports'];
  private _initializer: (t: Transaction) => void | Promise<void>;
  private _terminater: (t: Transaction) => void | Promise<void>;

  get rules() {
    if (!this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not get `rules` before server locked.',
    });
    return this._rules;
  }

  set exports(exportsValue: T['exports']) {
    if (!this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not set `exports` before server locked.',
    });
    this._exports = exportsValue;
  }

  get exports() {
    if (!this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not get `exports` before server locked.',
    });
    return this._exports;
  }

  set module(modal: T['module']) {
    if (!this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not set `module` before server locked.',
    });
    this._module = modal;
  }

  get module() {
    if (!this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not get `module` before server locked.',
    });
    return this._module;
  }

  set options(options: T['options']) {
    if (!this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not set `options` before server locked.',
    });
    this._options = options;
  }

  get options() {
    if (!this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not get `options` before server locked.',
    });
    return this._options;
  }

  set factory(factory: Factory) {
    if (this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not set `factory` after server locked.',
    });
    this._factory = factory;
  }

  get factory() {
    return this._factory;
  }

  constructor(rules: T['rules']) {
    this._rules = rules;
  }

  get initializer() {
    return this._initializer;
  }

  get terminater() {
    return this._terminater;
  }

  public setInitializer(callback: (t: Transaction) => void | Promise<void>) {
    if (this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not set `initializer` after server locked.',
    });
    this._initializer = callback;
    return this;
  }

  public setTerminater(callback: (t: Transaction) => void | Promise<void>) {
    if (this._locked) throw new CustomError({
      name: 'FACTORY_SERVER_CONTEXT_ERROR',
      message: 'You can not set `terminater` after server locked.',
    });
    this._terminater = callback;
    return this;
  }

  public lock() {
    this._locked = true;
    return this;
  }
}


export function MakeServerAnnotation<T extends ServerExtendtion>(callback: (server: ServerContext<T>) => T['exports']) {
  return (rules: T['rules']): ClassDecorator => {
    const server = new ServerContext(rules);
    return (target) => {
      const meta = NormalizeMetaData.bind(target);
      meta.set('initializer', (factory: Factory) => {
        server.factory = factory;
        const result = callback(server);
        server.lock();
        server.exports = result;
        return server;
      });
    }
  }
}