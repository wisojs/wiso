import { Factory } from '@wisojs/factory';
import { HttpService } from './http.server';
import { HttpServerInterface } from '../src';

type IHttpServer = HttpServerInterface<HttpService, { a: number }, { b: string }>;

const factory = new Factory();

const a = factory.use<IHttpServer>(HttpService, {
	port: 3000
});

console.log(a);

factory.listen();