import * as http from 'http';
import { Factory, Server, ServerRules } from '.';
import { Timer } from '@wisojs/common';

type httpConfigs = {
  port: number
}

const HttpServer = Server<ABC, httpConfigs>(({ factory, configs, target }) => {
  factory.on('initialize', () => new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      target.aa
    });
    server.listen(configs.port, (err?) => {
      if (err) return reject(err);
      resolve();
    });
  }))
});

@HttpServer({
  controllers: []
})
class ABC {
  aa() {}
}

const factory = new Factory();

factory.server(ABC, {});

// factory.on('initialize', () => console.log('initialize'));
factory.on('initialize', () => {
  console.log('doing');
  return new Promise(resolve => Timer.setTimeout(resolve, 5000));
});
// factory.on('terminate', () => console.log('terminate'));

factory.on('terminate', () => {
  console.log('undoing');
  return new Promise(resolve => Timer.setTimeout(resolve, 5000));
});

factory.initialize();