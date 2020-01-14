import { Controller, Path, Method, Component, Middleware as HttpMiddleware, Guard, HttpDefaultContext } from '../src';
import { Middleware } from 'koa-compose';

function logger(...str: any[]): Middleware<any> {
  return async (ctx, next) => {
    ctx.logger.info(...str);
    await next()
  }
}

@Controller('/')
export class IndexController extends Component{

  @Path('/')
  @Method('GET')
  @HttpMiddleware(logger('start middleware'))
  @Guard(logger('end middleware'))
  abc(ctx: HttpDefaultContext) {
    return 'hello world';
  }
}