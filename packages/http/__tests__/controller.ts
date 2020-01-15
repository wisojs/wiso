import { Controller, Component, Use, Guard, Get, Redirect, Param, BadGateway } from '../src';
import { Middleware } from 'koa-compose';

function logger(...str: any[]): Middleware<any> {
  return async (ctx, next) => {
    ctx.logger.info(...str);
    await next()
  }
}

@Controller('/')
export class IndexController extends Component{

  @Get('/:id(\\d+)')
  @Use(logger('start middleware'))
  @Guard(logger('end middleware'))
  abc(@Param('id') id: string) {
    throw new BadGateway('aaa');
    return id;
  }
}