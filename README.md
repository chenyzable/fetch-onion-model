# @cyzeal/fetch-onion-model

一个基于 Web Fetch Api 的轻量级 Http 请求增强工具，支持浏览器与 Node 环境，类似于 koa 的洋葱模型，以中间件形式扩展功能。

## Install

Using npm

`npm i -S @cyzeal/fetch-onion-model`

Using yarn

`yarn add @cyzeal/fetch-onion-model`

Using pnpm

`pnpm add @cyzeal/fetch-onion-model`

## Usage

### 快速上手

```js
import request from "@cyzeal/fetch-onion-model"

// 发送get请求
request("https://examples.com/somepath", {
  params: {
    foo: "bar",
  },
})
  .then((res) => {
    console.log(res)
  })
  .catch((error) => {
    console.error(error)
  })

// 发送post请求
request("https://examples.com/somepath", {
  method: "POST",
  // data参数会放在请求体中携带
  data: { foo: "foo" },
  // params参数会拼接在url上
  params: { bar: "bar" },
})
```

### 创建实例

支持通过 create 函数创建一个新的新的实例，可以配置默认 options 与 middleware

```js
import { create } from '@cyzeal/fetch-onion-model'

const baseOptions = {
  baseUrl: 'https://examples.com',
  credentials: 'include',
  validStatus(response){
    return response.status === 200
  }
}

// 这个函数每次请求都会在path前拼接上baseUrl、带上cookie、并且只判断status为200的请求为成功
const request = create(baseOptions)

request('/somepath'})
  .then(res=>{
  	console.log(res)
	})
	.catch(error=>{
  	console.error(error)
	})
```

内置中间件

retry 是基于[fetch-retry](https://github.com/jonbern/fetch-retry)封装的错误重试中间件

```js
import { create } from "@cyzeal/fetch-onion-model"
import retry from "@cyzeal/fetch-onion-model/esm/middleware/retry"

// 这个请求实例发出的每个请求发生错误都会每隔2000ms重试一次，一共重试3次
const request = create({}, [retry({ retries: 3, retryDelay: 2000 })])

// 可以覆盖默认的配置，下面这个请求仅当status为500时才会重试，一共重试2次
request("https://examples.com/somepath", {
  retries: 2,
  retryOn: [500],
})
```

timeout 是基于原生 AboutController 实现的超时取消请求

```js
import { create } from "@cyzeal/fetch-onion-model"
import timeout from "@cyzeal/fetch-onion-model/esm/middleware/timeout"

// 这个请求实例发出的每个请求超过5秒未响应都会超时
const request = create({}, [timeout(5000)])

// 可以覆盖默认的配置，下面这个请求超时时间为10秒
request("https://examples.com/somepath", {
  timeout: 10000,
})

// 支持通过函数动态设置
request("https://examples.com/somepath", {
  timeout: (ctx) => {
    if (ctx.url.includes("uploadFile")) {
      return 10000
    }
    return 3000
  },
})
```

自定义 middleware

```js
import { create } from '@cyzeal/fetch-onion-model'

const reportMiddleware = async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url}`)
  await next()
  console.log(`${ctx.method} ${ctx.url} done. status: ${ctx.status}`)
}

const errorHandleMiddleware = async (ctx, next) => {
  try {
    await next()
    // 如果走到这里表示已经拿到服务端返回的数据
    const { body } = ctx
    if(!body.success){
      throw new Error('request fial...')
    }
  } catch (error) {
    // 这里可以自定义错误处理
    console.error(error)
    ctx.body = { success: false }
  }
}
const baseOptions = {
  baseUrl: 'https://examples.com',
}
const request = create(baseOptions, [errorHandleMiddleware, reportMiddleware])
request('/somepath'})
  .then(res=>{
  	console.log(res)
	})
	.catch(error=>{
  	console.error(error)
	})
```

### 在 TypeScript 中使用

```ts
import { create } from "@cyzeal/fetch-onion-model"
import type { RequestOptions, MiddleWare } from "@cyzeal/fetch-onion-model"

interface Result<T> {
  success: boolean
  msg: string
  data: T
}

interface Data {
  content: string
}

const reportMiddleware: MiddleWare = async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url}`)
  await next()
  console.log(`${ctx.method} ${ctx.url} done. status: ${ctx.status}`)
}
const baseOptions: RequestOptions = {
  baseUrl: "https://examples.com",
}
const middlewares: MiddleWare[] = [reportMiddleware]
const request = create(baseOptions, middlewares)

const res = await request<Result<Data>>("/somepath")
```

### 在 NodeJs 中使用

```js
import { create } from '@cyzeal/fetch-onion-model'
import nodeFetch from 'node-fetch'

const request = create({},{ fetch: nodeFetch })

request(...)
```

### API

RequestOptions

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| method | 传入给 fetch 的请求方式 | string | 'GET' |
| params | 请求携带的 url 参数 | object \| URLSearchParams | - |
| data | 请求携带的 body 参数，支持原生 fetch option 中 body 字段的所有类型 | object \| FormData \| Blob \| string | - |
| baseUrl | 拼接在 url 字段的前缀 | string | - |
| timeout | 开启 timeout 中间件后生效！请求超时时间，单位 ms，不传或传入 0 则请求不会自动超时 | number | - |
| retries | 开启 retry 中间件后生效！请求失败重试次数 | number | - |
| retryDelay | 开启 retry 中间件后生效！请求重试的间隔 | number \| (attempt: number, error: Error \| null, response: Response \| null) => number | - |
| retryOn | 开启 retry 中间件后生效！判断请求失败的状态码集合 | number[] \| (attempt: number, error: Error \| null, response: Response \| null) => number[] | - |
| fetch | 用于发起请求的 fetch 实例，可以传入`whatwg-fetch`或`isomorphic-fetch`导出的 fetch 对象 | Fetch | `globalThis.fetch` |
| transformParams | 自定义对 params 的序列化，默认通过 URLSearchParams 的 append 后 toString 进行序列化，可以自定义通过`qs`库序列化来对数组等类型值的个性化处理 | (params: T)=> string | - |
| transformResponse | 自定义对 response 的处理，默认如果响应头中包含`Content-Type: application/json`，会返回`response.json()`，否则会返回`response.text()` | (Response:Response) => T | - |
| onError | 请求发生错误的回调函数 | (error: Error, context: Context )=>void | - |
| 支持原生 Fetch Options 的所有参数 | ... | ... | ... |
