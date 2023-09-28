import { beforeAll, afterAll, afterEach } from 'vitest'
import fetch, { Headers, Request, Response } from 'node-fetch'
import { AbortController, abortableFetch } from 'abortcontroller-polyfill/dist/cjs-ponyfill'
import { server } from './test/mock/server'

if (!globalThis.fetch) {
  globalThis.fetch = abortableFetch(fetch)
  globalThis.Headers = Headers
  globalThis.Request = Request
  globalThis.Response = Response
  globalThis.AbortController = AbortController
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
