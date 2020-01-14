import { NormalizeMetaData } from '@wisojs/common';
import { Middleware as KoaMiddleware } from 'koa';
import { HTTPMethod } from 'find-my-way';

export const Controller = NormalizeMetaData.setFunction('prefix', (oldValue, newValue) => newValue);
export const Path = NormalizeMetaData.setFunction('path', (oldValue, newValue) => newValue);

export const Middleware = NormalizeMetaData.setFunction('middlewares', (oldValue: KoaMiddleware[], ...newValues: KoaMiddleware[]) => {
  if (!oldValue) oldValue = [];
  oldValue.unshift(...newValues);
  return oldValue;
});

export const Method = NormalizeMetaData.setFunction('methods', (oldValue: HTTPMethod[], ...newValue: HTTPMethod[]) => {
  if (!oldValue) oldValue = [];
  newValue.forEach(method => {
    if (oldValue.indexOf(method) === -1) {
      oldValue.push(method);
    }
  });
  return oldValue;
});

export const Guard = NormalizeMetaData.setFunction('_middlewares', (oldValue: KoaMiddleware[], ...newValues: KoaMiddleware[]) => {
  if (!oldValue) oldValue = [];
  oldValue.unshift(...newValues);
  return oldValue;
});