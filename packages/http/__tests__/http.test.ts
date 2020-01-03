import { Factory } from '@wisojs/factory';
import { HttpService } from './http.server';

const factory = new Factory();

factory.server(HttpService, {
	port: 3000
});

factory.initialize();