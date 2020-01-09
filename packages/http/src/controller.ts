import { Http } from './http';
import * as Koa from 'koa';

export class Component<
  S extends Koa.DefaultState = Koa.DefaultState, 
  C extends Koa.DefaultContext = Koa.DefaultContext
> {
  private readonly http: Http<S, C>;
  constructor(http: Http<S, C>) {
    this.http = http;
  }

  get logger() {
    return this.http.logger;
  }

  get Service() {
    return this.http.factory.Service;
  }
}