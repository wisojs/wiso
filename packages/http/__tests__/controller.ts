import { Controller, Path, Method } from '../src';

@Controller('/')
export class IndexController {

  @Path('/')
  @Method('GET')
  abc(ctx) {
    return 'hello world' + ctx.url
  }
}