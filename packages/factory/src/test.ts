import { Factory } from '.';
import { Timer } from '@wisojs/common'

const factory = new Factory();

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