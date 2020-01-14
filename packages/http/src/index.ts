import 'reflect-metadata';
import { Factory, MakeServerAnnotation, ServerExtendtion } from '@wisojs/factory';
import { Http } from './http';
import { Transaction } from '@wisojs/common';
import { interfaces } from 'inversify';
import { Config, HTTPVersion } from 'find-my-way';

export * from './annotations';
export * from './http';
export * from './controller';

export interface HttpServerConfigs extends Config<HTTPVersion.V1> {
  port?: number,
  host?: string,
}

export interface HttpServerRules {
  constrollers: interfaces.Newable<any>[]
}

export type HttpServerInterface<
  M extends HttpServerImplements, 
  S = {}, 
  C = {}
> = ServerExtendtion<
  HttpServerConfigs, 
  Http<S, C>, 
  M, 
  HttpServerRules
>;

export function HttpServer<
  M extends HttpServerImplements, 
  T extends HttpServerInterface<M> = any // ignore
>(rules: T['rules']) {
  return MakeServerAnnotation<HttpServerInterface<M>>(server => {
    const http = new Http(server.factory);
    server.setInitializer(transaction => http.initialize(transaction, server.options, server.module, server.rules));
    server.setTerminater(transaction => http.terminate(transaction, server.module));
    return http;
  })(rules);
}

export declare class HttpServerImplements {
  constructor(factory: Factory, options: HttpServerConfigs);
  serverWillCreate?(transaction: Transaction): void | Promise<void>;
  serverCreated?(transaction: Transaction): void | Promise<void>;
  serverWillDestroy?(transaction: Transaction): void | Promise<void>;
  serverDestroyed?(transaction: Transaction): void | Promise<void>;
}