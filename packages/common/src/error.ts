export class CustomError extends Error {
  public readonly name: string;
  public readonly code: string | number;
  public readonly level: string | number;
  
  constructor(options: string | {
    name?: string,
    message: string,
    code?: string | number,
    level?: string | number
  }) {
    if (typeof options === 'string') {
      options = {
        message: options,
      }
    }
    super(options.message);
    this.code = options.code;
    this.level = options.level;
    this.name = options.name || 'Error';
  }
}