import { Server } from '@wisojs/factory';
import { Http } from './http';
import { Transaction } from '@wisojs/common';

export interface HttpServerImplements {
  serverWillCreate?(transaction: Transaction): void | Promise<void>;
  serverCreated?(transaction: Transaction): void | Promise<void>;
  serverWillDestroy?(transaction: Transaction): void | Promise<void>;
  serverDestroyed?(transaction: Transaction): void | Promise<void>;
}

export interface HttpServerConfigs {
  port?: number,
  host?: string,
}

export interface HttpServerRules {
  constrollers: any[]
}

export const HttpServer = Server<HttpServerImplements, HttpServerConfigs, HttpServerRules>(({ factory, configs, target }) => {
  const http = new Http();
  factory.on('initialize', async (transaction) => {
    http.initialize(transaction, configs, target);
  });
  factory.on('terminate', async (transaction) => {
    http.terminate(transaction, target);
  });
});