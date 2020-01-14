import { Http } from './http';
import * as Koa from 'koa';

export class Component<S = {}, C = {}> {
  public readonly app: Http<S, C>;
  constructor(app: Http<S, C>) {
    this.app = app;
  }

  get logger() {
    return this.app.logger;
  }

  get Service() {
    return this.app.factory.Service;
  }
}