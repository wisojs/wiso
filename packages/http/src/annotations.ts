import { NormalizeMetaData, ParameterMetaData } from '@wisojs/common';
import { Middleware as KoaMiddleware, Context, Next } from 'koa';
import { HTTPMethod } from 'find-my-way';

export const Controller = NormalizeMetaData.setFunction('prefix', (oldValue, newValue) => newValue || '/');
export const Path = NormalizeMetaData.setFunction('path', (oldValue, newValue) => newValue || '/');

export const Use = NormalizeMetaData.setFunction('middlewares', (oldValue: KoaMiddleware[], ...newValues: KoaMiddleware[]) => {
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

export const Acl = HttpMethodResolver('ACL');
export const Bind = HttpMethodResolver('BIND');
export const Checkout = HttpMethodResolver('CHECKOUT');
export const Connect = HttpMethodResolver('CONNECT');
export const Copy = HttpMethodResolver('COPY');
export const Delete = HttpMethodResolver('DELETE');
export const Get = HttpMethodResolver('GET');
export const Head = HttpMethodResolver('HEAD');
export const Link = HttpMethodResolver('LINK');
export const Lock = HttpMethodResolver('LOCK');
export const Msearch = HttpMethodResolver('M-SEARCH');
export const Merge = HttpMethodResolver('MERGE');
export const Mkactivity = HttpMethodResolver('MKACTIVITY');
export const Mkcalendar = HttpMethodResolver('MKCALENDAR');
export const Mkcol = HttpMethodResolver('MKCOL');
export const Move = HttpMethodResolver('MOVE');
export const Notify = HttpMethodResolver('NOTIFY');
export const Options = HttpMethodResolver('OPTIONS');
export const Patch = HttpMethodResolver('PATCH');
export const Post = HttpMethodResolver('POST');
export const Propfind = HttpMethodResolver('PROPFIND');
export const Proppatch = HttpMethodResolver('PROPPATCH');
export const Purge = HttpMethodResolver('PURGE');
export const Put = HttpMethodResolver('PUT');
export const Rebind = HttpMethodResolver('REBIND');
export const Report = HttpMethodResolver('REPORT');
export const Search = HttpMethodResolver('SEARCH');
export const Source = HttpMethodResolver('SOURCE');
export const Subscribe = HttpMethodResolver('SUBSCRIBE');
export const Trace = HttpMethodResolver('TRACE');
export const Unbind = HttpMethodResolver('UNBIND');
export const Unlink = HttpMethodResolver('UNLINK');
export const Unlock = HttpMethodResolver('UNLOCK');
export const Unsubscribe = HttpMethodResolver('UNSUBSCRIBE');

export function HttpCode(code: number) {
  return Guard(async (ctx: Context, next: Next) => {
    ctx.status = code;
    await next();
  });
}

export function Header(key: string | { [key: string]: string }, value?: string | string[]) {
  return Guard(async (ctx: Context, next: Next) => {
    if (!value && typeof key !== 'string') {
      ctx.set(key);
    } else {
      ctx.set(key as string, value);
    }
    await next();
  });
}

export function Redirect(url: string, code: number = 302) {
  return Guard(async (ctx: Context, next: Next) => {
    const value: { url: string, statusCode: number } = ctx.body;
    ctx.redirect(value.url || url);
    ctx.status = value.statusCode || code;
    await next();
  });
}

export function Headers(field?: string) {
  return ParameterMetaData.setWithArguments<Context>((ctx, key?: string) => {
    if (!key) return ctx.headers;
    return ctx.headers[key];
  })(field);
}

export function Query(field?: string) {
  return ParameterMetaData.setWithArguments<Context>((ctx, key?: string) => {
    if (!key) return ctx.query;
    return ctx.query[key];
  })(field);
}

/**
 * get url params
 * @param field {string} optional field name in params
 * 
 * Use
 *  @Param params: any
 *  @param('id') id: string
 */
export function Param(field?: string) {
  return ParameterMetaData.setWithArguments<Context>((ctx, key?: string) => {
    if (!key) return ctx.params;
    return ctx.params[key];
  })(field);
}

/**
 * Cookie getter or setter.
 * @param field {string} field name in cookies
 * @param callback {string | (data: any) => string} value name when cookie setting.
 * 
 * Method:
 *  @Cookie('abc', 'des')
 *  @Cookie('abc', (data) => data.des);
 * 
 * Parameter:
 *  @Cookie('abc') abc: string
 */
export function Cookie(field: string, callback?: string | ((data: any) => string)) {
  if (callback) return Guard(async (ctx: Context, next: Next) => {
    ctx.cookies.set(field, typeof callback === 'string' ? callback : callback(ctx.body));
    await next();
  });
  return ParameterMetaData.setWithArguments<Context>((ctx, key: string) => ctx.cookies.get(key))(field);
}

// @Files body: any
export const Body = ParameterMetaData.setWithoutArguments<Context>(ctx => {
  const req = ctx.request as { body: any } & Context['request'];
  return req.body;
});

// @Files files: any
export const Files = ParameterMetaData.setWithoutArguments<Context>(ctx => {
  const req = ctx.request as { files: any } & Context['request'];
  return req.files;
});

// @Req req: Koa.Context['req']
export const Req = ParameterMetaData.setWithoutArguments<Context>(ctx => ctx.req);

// @Res res: Koa.Context['res']
export const Res = ParameterMetaData.setWithoutArguments<Context>(ctx => ctx.res);

// @Request request: Koa.Context['request']
export const Request = ParameterMetaData.setWithoutArguments<Context>(ctx => ctx.request);

// @Response response: Koa.Context['response']
export const Response = ParameterMetaData.setWithoutArguments<Context>(ctx => ctx.response);

function HttpMethodResolver(method: HTTPMethod) {
  return (str: string = '/'): MethodDecorator => {
    return (target, property, descriptor) => {
      const meta = NormalizeMetaData.bind(descriptor.value);
      meta.set('path', str);
      const methods = meta.has('methods') ? meta.get('methods') : [];
      if (methods.indexOf(method) === -1) {
        methods.push(method);
      }
      meta.set('methods', methods);
    }
  }
}