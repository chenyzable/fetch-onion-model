import type { RequestInitWithRetry } from "fetch-retry"
import type {
  RequestOptions,
  RequestMethod,
  Context,
  MiddleWare,
  NextFunction,
  TBody,
  TData,
  TParam,
} from "./interface"
import compose from "./compose"
import fetchCore from "./fetchCore"

const createContext = <R, D, P>(url: string, options?: RequestOptions<R, D, P>) => {
  const {
    // fetch的所有options
    body,
    cache,
    credentials,
    headers,
    integrity,
    keepalive,
    method = "GET",
    mode,
    redirect,
    referrer,
    referrerPolicy,
    signal,
    window,
    retries,
    retryDelay,
    retryOn,
    next,
    // 自定义其它配置项
    params = null,
    data = null,
    fetch = globalThis.fetch,
    // baseUrl,
    // params = null,
    // data = null,
    // timeout,
    // fetch = globalThis.fetch,
    // onError,
    // validStatus,
    // transformParams,
    // transformResponse,
    ...otherOptions
  } = options || {}

  const normalizeHttpHeader = (headersInit?: HeadersInit) => {
    const header = new Headers(headersInit)
    if (!header.has("Content-Type")) {
      header.append("Content-Type", "application/json")
    }
    return header
  }

  const fetchOptions: RequestInitWithRetry = {
    method: method.toUpperCase() as RequestMethod,
    headers: normalizeHttpHeader(headers),
    body,
    cache,
    credentials,
    integrity,
    keepalive,
    mode,
    redirect,
    referrer,
    referrerPolicy,
    signal,
    window,
    retries,
    retryDelay,
    retryOn,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore next.js扩展配置
    next,
  }

  const context: Context<R, D, P> = {
    ...otherOptions,
    url,
    params,
    data,
    body: null,
    response: null,
    fetch,
    options: {
      method: method.toUpperCase() as RequestMethod,
      headers: normalizeHttpHeader(headers),
      ...fetchOptions,
    },
  }

  return context
}

const createRequest = <TResponse, TOptionData, TOptionParams>(
  onion: ReturnType<typeof compose>,
  baseOptions?: RequestOptions<TResponse, TOptionData, TOptionParams>,
) => {
  return async <R = TResponse, D = TOptionData, P = TOptionParams>(
    url: string,
    options?: RequestOptions<R, D, P>,
  ) => {
    const ctx = createContext<R, D, P>(url, {
      ...(baseOptions as unknown as RequestOptions<R, D, P>),
      ...options,
    })
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await onion(ctx)
      const { body } = ctx
      return body as R
    } catch (error: unknown) {
      if (typeof ctx.onError === "function") {
        ctx.onError(error as Error, ctx)
      }
      return Promise.reject(error)
    }
  }
}

const create = <R = TBody, D = TData, P = TParam>(
  baseOptions: RequestOptions<R, D, P> = {},
  middlewares: MiddleWare[] = [],
) => {
  const onion = compose([...middlewares, fetchCore()])
  return createRequest<R, D, P>(onion, baseOptions)
}

const request = create()

export { create }

export type { RequestOptions, RequestMethod, MiddleWare, Context, NextFunction }

export default request
