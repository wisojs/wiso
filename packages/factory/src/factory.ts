import { Container, interfaces } from 'inversify';
import { Drive, DriveOptions } from './drive';
import { NormalizeMetaData, CustomError } from '@wisojs/common';
import { ServerExtendtion, ServerContext } from './server';

export class Factory {
  private drive: Drive;
  public readonly Service: Container;

  get logger() {
    return this.drive.logger;
  }

  constructor(options: interfaces.ContainerOptions & DriveOptions = {}) {
    this.drive = new Drive(options);
    this.Service = new Container(options);
  }

  public async listen() {
    return await this.drive.initialize();
  }

  public use<T extends ServerExtendtion>(serverModule: T['moduleConstructor'], options: T['options']): T['exports'] {
    const meta = NormalizeMetaData.bind(serverModule);
    
    if (!meta || !meta.size || !meta.has('initializer')) throw new CustomError({
      name: 'FACTORY_USE_ERROR',
      message: 'This initializer is not validable.',
    });

    const callback = meta.get('initializer') as (factory: Factory) => ServerContext<T>;
    const context = callback(this);

    context.module = new serverModule(this, options);
    context.options = options;
    
    context.initializer 
      && this.drive.on('initialize', transaction => context.initializer(transaction));

    context.terminater
      && this.drive.on('terminate', transaction => context.terminater(transaction));

    return context.exports;
  }
}

