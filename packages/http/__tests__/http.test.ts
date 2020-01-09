import { Factory } from '@wisojs/factory';
import { HttpService } from './http.server';

const factory = new Factory();

const a = factory.server(HttpService, {
	port: 3000
});

console.log(a)

factory.initialize();