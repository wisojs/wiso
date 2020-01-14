import * as http from 'http';
import * as Koa from 'koa';
import * as path from 'path';
import * as Router from 'find-my-way';
import * as Compose from 'koa-compose';
import { Transaction, NormalizeMetaData, CustomError } from '@wisojs/common';
import { HttpServerConfigs, HttpServerImplements, HttpServerRules } from '.';
import { Middleware } from 'koa';
import { Factory } from '@wisojs/factory';

export type HttpDefaultContext = Koa.Context & {
  logger: Factory['logger']
}

export class Http<S = {}, C = {}> extends Koa<Koa.DefaultState & S, HttpDefaultContext & C> {
  private server: http.Server;
  public readonly factory: Factory;

  constructor(factory: Factory) {
    super();
    this.factory = factory;
    Object.defineProperty(this.context, 'logger', {
      value: this.factory.logger
    });
  }

  get logger() {
    return this.factory.logger;
  }
  
  private injectRouter(rules: HttpServerRules, configs: HttpServerConfigs) {
    const router = this.installControllers(rules.constrollers, configs);
    this.use(async (ctx, next) => {
      const res = router.lookup(ctx.req, ctx.res, ctx);
      await Promise.resolve(res);
      await next();
    });
  }

  private installControllers(controllers: HttpServerRules['constrollers'], configs: HttpServerConfigs) {
    const router = Router({
      ignoreTrailingSlash: configs.ignoreTrailingSlash,
      maxParamLength: configs.maxParamLength,
      allowUnsafeRegex: configs.allowUnsafeRegex,
      caseSensitive: configs.caseSensitive,
      versioning: configs.versioning,
      defaultRoute() { this.status = 404; },
      onBadUrl(path) {
        this.status = 400;
        this.body = `Bad path: ${path}`;
      }
    });
    controllers.forEach(controller => {
      const meta = NormalizeMetaData.bind(controller);
      if (!meta || !meta.size) return;

      // router prefix: string
      const prefix = meta.get<string>('prefix') || '/';

      // controller middleware for this router global
      const mds = meta.get<Middleware[]>('middlewares') || [];

      const properties = Object.getOwnPropertyNames(controller.prototype);

      // controller cache object.
      const target = new controller(this);

      properties.forEach(property => {
        if (property === 'constructor') return;
        const that = controller.prototype[property];
        const md_meta = NormalizeMetaData.bind(that);
        if (!md_meta || !md_meta.size) return;

        // controller path: string
        const rPath = md_meta.get<string>('path');

        // controller method
        const rMethods = md_meta.get<Router.HTTPMethod[]>('methods');

        // controller single middlewares
        const rMiddlewares = md_meta.get<Middleware[]>('middlewares') || [];

        // controller single guards
        const _rMiddlewares = md_meta.get<Middleware[]>('_middlewares') || [];

        if (rPath && rMethods && Array.isArray(rMethods) && rMethods.length) {
          const middlewares = mds.slice(0).concat(rMiddlewares);
          middlewares.push(async (ctx, next) => {
            ctx.body = await target[property](ctx);
            await next();
          });
          if (_rMiddlewares.length) middlewares.push(..._rMiddlewares);
          const middlewareComposed = Compose(middlewares);
          router.on(rMethods, path.join(prefix, './', rPath), function(req, res, params) {
            this.params = params;
            return middlewareComposed(this);
          })
        }
      })
    });
    return router;
  }

  public async initialize(
    transaction: Transaction, 
    configs: HttpServerConfigs, 
    target: HttpServerImplements, 
    rules: HttpServerRules
  ) {
    target.serverWillCreate && await Promise.resolve(target.serverWillCreate(transaction));
    this.injectRouter(rules, configs);
    this.server = await new Promise((resolve, reject) => {
      const server = http.createServer(this.callback());
      const port = configs.port || 8080;
      const host = configs.host || '0.0.0';
      server.listen(port, host, (err?: Error | CustomError) => {
        if (err) return reject(err);
        resolve(server);
      })
    });
    transaction.stash(() => this.server.close());
    target.serverCreated && await Promise.resolve(target.serverCreated(transaction));
  }

  public async terminate(
    transaction: Transaction, 
    target: HttpServerImplements
  ) {
    target.serverWillDestroy && await Promise.resolve(target.serverWillDestroy(transaction));
    this.server && this.server.close();
    target.serverDestroyed && await Promise.resolve(target.serverDestroyed(transaction));
  }
}