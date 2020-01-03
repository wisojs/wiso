import { HttpServer, HttpServerImplements, HttpServerConfigs } from '../src';
import { Factory } from '@wisojs/factory';

@HttpServer({
  constrollers: []
})
export class HttpService implements HttpServerImplements {

  private readonly factory: Factory;
  private readonly port: number;

  constructor(factory: Factory, configs: HttpServerConfigs) {
    this.factory = factory;
    this.port = configs.port;
  }

  get logger() {
    return this.factory.logger;
  }

  serverCreated() {
    this.logger.info('server started at http://127.0.0.1:' + this.port);
  }

  serverDestroyed() {
    this.logger.info('server destroyed');
  }
}