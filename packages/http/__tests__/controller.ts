import { Controller, Path, Method, Component, Middleware } from '../src';

@Controller('/')
export class IndexController extends Component{

  @Path('/')
  @Method('GET')
  abc(ctx) {
    // 我希望这里的ctx就是{abc:number}
    return 'hello world' + ctx.url
  }
}