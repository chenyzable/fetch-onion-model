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
    method = "GET",
    baseUrl,
    params = null,
    data = null,
    timeout,
    fetch = globalThis.fetch,
    onError,
    validStatus,
    transformParams,
    transformResponse,
    headers,
    ...other
  } = options || {}

  const normalizeHttpHeader = (headersInit?: HeadersInit) => {
    const header = new Headers(headersInit)
    if (!header.has("Content-Type")) {
      header.append("Content-Type", "application/json")
    }
    return header
  }

  const context: Context<R, D, P> = {
    url,
    baseUrl,
    params,
    data,
    body: null,
    response: null,
    timeout,
    fetch,
    transformParams,
    transformResponse,
    validStatus,
    onError,
    options: {
      method: method.toUpperCase() as RequestMethod,
      headers: normalizeHttpHeader(headers),
      ...other,
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
