import 'reflect-metadata';
import { Server } from '@wisojs/factory';
import { Http } from './http';
import { Transaction } from '@wisojs/common';
import { interfaces } from 'inversify';
import { Config, HTTPVersion } from 'find-my-way';

export * from './annotations';
export * from './http';
export * from './controller';

export interface HttpServerImplements {
  serverWillCreate?(transaction: Transaction): void | Promise<void>;
  serverCreated?(transaction: Transaction): void | Promise<void>;
  serverWillDestroy?(transaction: Transaction): void | Promise<void>;
  serverDestroyed?(transaction: Transaction): void | Promise<void>;
}

export interface HttpServerConfigs extends Config<HTTPVersion.V1> {
  port?: number,
  host?: string,
}

export interface HttpServerRules {
  constrollers: interfaces.Newable<any>[]
}

export const HttpServer = Server<
  HttpServerImplements, 
  HttpServerConfigs, 
  HttpServerRules
>(({ factory, configs, target, rules }) => {
  const http = new Http(factory);
  factory.on('initialize', async (transaction) => http.initialize(transaction, configs, target, rules));
  factory.on('terminate', async (transaction) => http.terminate(transaction, target));
  return http;
});