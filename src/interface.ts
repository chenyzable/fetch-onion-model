import type { RequestInitRetryParams } from "fetch-retry"

export type TParam = Record<string, unknown>
export type TData = Record<string, unknown> | BodyInit
export type TBody = Record<string, unknown> | string

export type RequestMethod = ("GET" | "POST" | "PUT" | "DELETE" | "OPTIPN" | "HEAD") & string

export interface Context<R = TBody, D = TData, P = TParam> {
  url: string
  baseUrl?: string
  params: P | URLSearchParams | null
  data: D | null
  body: R | null
  response: Response | null
  timeout?: number
  fetch?: typeof fetch
  transformParams?: (params: P) => string
  transformResponse?: (data: Response) => R | Promise<R>
  validStatus?: (response: Response) => boolean
  onError?: (error: Error, context: Context<any, any, any>) => void
  options: RequestInit
  [key: string]: unknown
}

export interface RequestOptions<R = TBody, D = TData, P = TParam>
  extends RequestInit,
    RequestInitRetryParams {
  baseUrl?: string
  method?: RequestMethod
  params?: P | URLSearchParams
  data?: D
  timeout?: number
  fetch?: typeof fetch
  transformParams?: (params: P) => string
  transformResponse?: (response: Response) => R | Promise<R>
  validStatus?: (response: Response) => boolean
  onError?: (error: Error, context: Context) => void
}

export type NextFunction = () => Promise<void>

export type MiddleWare = (ctx: Context, next: NextFunction) => Promise<void>

export {}
