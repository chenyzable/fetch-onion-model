import { rest } from 'msw'
import { setupServer } from 'msw/node'

export const prefix = (path) => `https://mock.com${path}`

const handlers = [
  rest.get(prefix('/simpleGet'), (req, res, ctx) => {
    return res(ctx.text(`mock response text: ${req.url.searchParams.get('text')}`))
  }),
  rest.post(prefix('/simplePost'), (req, res, ctx) => {
    return res(ctx.json({ success: true, data: 'ok' }))
  }),
  rest.post(prefix('/getJson'), async (req, res, ctx) => {
    const params = req.url.searchParams
    const data = await req.json()

    return res(
      ctx.json({
        content: 'mock json',
        params: {
          arr: params.getAll('arr'),
          foo: params.get('foo'),
        },
        data,
      }),
    )
  }),
  rest.post(prefix('/forwardHeader'), (req, res, ctx) => {
    const keys = req.headers.keys()
    const customHeaders: Record<string, string> = {}
    for (const key of keys) {
      if (key.toLowerCase().startsWith('x')) {
        customHeaders[key] = req.headers.get(key)!
        ctx.set(key, customHeaders[key])
      }
    }

    return res(ctx.json({ success: true, data: customHeaders }))
  }),
  rest.get(prefix('/delay1500ms'), (req, res, ctx) => {
    return res(ctx.delay(3500), ctx.text('ok'))
  }),
  rest.get(prefix('/make404'), (req, res, ctx) => {
    return res(ctx.status(404))
  }),
  rest.get(prefix('/make500'), (req, res, ctx) => {
    return res(ctx.status(500))
  }),
]

export const server = setupServer(...handlers)
