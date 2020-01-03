import { Container, interfaces } from 'inversify';
import { AsyncEventEmitter, Timer, Transaction, CustomError, NormalizeMetaData } from '@wisojs/common';
import { ServerInitializer } from './server';

export * from './server';

type FactoryEvents = {
  initialize: [Transaction],
  terminate: [Transaction],
}

interface FactoryOptions {
  logger?: Console,
  terminateTimeout?: number,
};

export class Factory extends AsyncEventEmitter<FactoryEvents> {
  private closing = false;
  public readonly logger: Console;
  private readonly terminateTimeout: number;
  
  /**
   * factory.Service is an container in iversify.
   * factory.Service.bind | factory.Service.get
   */
  public readonly Service: Container;

  constructor(options: interfaces.ContainerOptions & FactoryOptions = {}) {
    super();
    this.logger = options.logger || console;
    this.terminateTimeout = options.terminateTimeout || 0;
    this.Service = new Container(options);

    process.on('beforeExit', this.terminate.bind(this));
    process.on('SIGINT', this.terminate.bind(this));
    process.on('SIGTERM', this.terminate.bind(this));
    process.on('SIGQUIT', this.terminate.bind(this));
  }

  public initialize() {
    const transaction = new Transaction(this.logger);
    return transaction.begin(async () => {
      transaction.stash(() => this.terminate());
      return await this.emit('initialize', transaction);
    }).catch(e => this.terminate());
  }

  private terminate() {
    if (this.closing) return;
    this.closing = true;
    const transaction = new Transaction(this.logger);
    transaction.begin(() => new Promise((resolve, reject) => {
      if (this.terminateTimeout > 0) {
        Timer.setTimeout(() => {
          Timer.destroy();
          reject(new CustomError({
            name: 'EXITTIMEOUTERROR',
            message: 'Exit Timeouted: ' + this.terminateTimeout + 'ms',
          }));
        }, this.terminateTimeout);
      }
      this.emit('terminate', transaction)
        .then((data) => { Timer.destroy(); resolve(data); })
        .catch(e => { Timer.destroy(); reject(e); });
    })).then(() => process.exit(0)).catch(() => process.exit(1));
  }

  public server<U = any, Z = any>(serverModule: interfaces.Newable<Z>, options: U) {
    const meta = NormalizeMetaData.bind(serverModule);
    if (!meta || !meta.has('initialize')) throw new CustomError({
      message: 'This must be a server module',
      name: 'SERVERMODULEERROR'
    });
    const target = new serverModule(this, options);
    const callback = meta.get<ServerInitializer<Z, U>>('initialize');
    callback(this, target, options);
  }
}