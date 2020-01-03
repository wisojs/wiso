import * as http from 'http';
import * as Koa from 'koa';
import { Transaction } from '@wisojs/common';
import { HttpServerConfigs, HttpServerImplements } from '.';

export class Http<S = {}, C = {}> extends Koa<S & Koa.DefaultState, C & Koa.DefaultContext> {
  private server: http.Server;
  
  private injectRouter() {
    this.use(async (ctx, next) => {
      ctx.body = 'hello';
      await next();
    });
  }

  public async initialize(transaction: Transaction, configs: HttpServerConfigs, target: HttpServerImplements) {
    target.serverWillCreate && await Promise.resolve(target.serverWillCreate(transaction));
    this.injectRouter();
    this.server = await new Promise((resolve, reject) => {
      const server = http.createServer(this.callback());
      const port = configs.port || 8080;
      const host = configs.host || '0.0.0';
      server.listen(port, host, (err?) => {
        if (err) return reject(err);
        resolve(server);
      })
    });
    transaction.stash(() => this.server.close());
    target.serverCreated && await Promise.resolve(target.serverCreated(transaction));
  }

  public async terminate(transaction: Transaction, target: HttpServerImplements) {
    target.serverWillDestroy && await Promise.resolve(target.serverWillDestroy(transaction));
    this.server && this.server.close();
    target.serverDestroyed && await Promise.resolve(target.serverDestroyed(transaction));
  }
}