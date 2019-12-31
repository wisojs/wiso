export class Transaction {
  private rejection: null | ((reson?: any) => void) = null;
  private readonly stacks: (() => any | Promise<any>)[] = [];
  private readonly logger: Console;

  constructor(logger: Console = console) {
    this.logger = logger;
  }

  public stash<T = any>(callback: () => T | Promise<T>) {
    this.stacks.push(callback);
    return this;
  }

  private async rollback() {
    let i = this.stacks.length;
    while (i--) await Promise.resolve(this.stacks[i]());
  }

  public begin<T = any>(callback: () => T | Promise<T>) {
    return (new Promise<T>((resolve, reject) => {
      this.rejection = reject;
      process.on('unhandledRejection', reject);
      process.on('uncaughtException', reject);
      return Promise.resolve<T>(callback()).then((data: T) => resolve(data)).catch(reject);
    })).then(() => this.clear()).catch(e => {
      this.clear();
      this.logger.error(e);
      return this.rollback();
    });
  }

  private clear() {
    if (this.rejection) {
      process.off('unhandledRejection', this.rejection);
      process.off('uncaughtException', this.rejection);
      this.rejection = null;
    }
  }
}