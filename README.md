<p align="center">
  <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vitejs.dev/logo.svg" alt="Vite logo">
  </a>
</p>

# vite-ssr-vue 
> For building powerful Server Side Rendering APP with **Vite 2** ⚡(Next Generation Frontend Tooling)

Inspired by vite-ssr

## Features

- Fast HMR with vite
- Easy development start
- Small library size
- Compatible with Vite's plugin
- Support `teleports`
- Flexible configuration and full control
- Support `shouldPreload` and `shouldPrefetch`

## Documentation

https://webigorkiev.github.io/vite-ssr-vue/

## Installation

Create a normal Vite project for Vue3.

```bash
    yarn add vite-ssr-vue @vue/server-renderer @vueuse/head node-html-parser @rollup/plugin-replace 
```

## Usage

### vite > 2.7.9

There is no way to use a single entry point.

```typescript
// entry-client.ts
import ssr from "vite-ssr-vue/client";
import App from "./App.vue";

export default ssr(App);
```

```typescript
// entry-server.ts
import ssr from "vite-ssr-vue/server";
import App from "./App.vue";

export default ssr(App);
```


### vite <= 2.7.9

```typescript
// vite.config.js
import vue from "@vitejs/plugin-vue";
import ssr from "vite-ssr-vue/plugin";

export default {
    plugins: [
        ssr(),
        vue(),
    ],
}
```
Then, simply import the main handler in your main entry file as follows

```typescript
// main.ts
import createSsr from "vite-ssr-vue";
import App from "./App.vue";

export default createSsr(App);
```

There can be only one entry point for the server and for the client. Plugin automatically changes alias for SSR. If for some reason you need separate entry points, then specify the server side in the **ssr** parameter

<details><summary>Available options for Vite plugin</summary>
<p>

- `name`: plugin name (default: vite-ssr-vue)
- `ssr`: server entry point

</p>
</details>

## Complete example using router and vuex

```typescript
import ssr from "vite-ssr-vue";
import App from "./App.vue";
import createRouter from "./routes";
import createStore from "./store";
import {createHead} from "@vueuse/head";
import {createPrefetch} from "@vuemod/prefetch";

// ...
export default ssr(App, {
    created({app, url, isClient, initialState}) {
        const head = createHead();
        const router = createRouter();
        const store = createStore();
        const prefetch = createPrefetch();
        app.use(router);
        app.use(store);
        app.use(head);
        app.use(prefetch, router, store);

        return {head, router, store}
    },
    
    mounted({router}) {
        // Some actions with router in isReady moment
    }
});


```

<details><summary>Available options for Vite plugin</summary>
<p>

- `created`: ({app, url, isClient, initialState}) - Hook that is called before each request, can be async. May return {router, store, head}
- `serializer`: Custom function for serialization initial state
- `shouldPreload`: shouldPreload aka [shouldPreload](https://ssr.vuejs.org/api/#shouldpreload)
- `shouldPrefetch`: shouldPrefetch aka [shouldPrefetch](https://ssr.vuejs.org/api/#shouldprefetch)
- `mount`: mount options for client side
- `rootProps`: root props

</p>
</details>

## Accessing context, res and req objects

In the built-in dev server, context, req, res objects are passing to created hook. 
In production, you must pass these objects to the rendering function in order to have them available.

```typescript

({html} = await entry(url, {
    manifest,
    res,
    req,
    context
}));
```

## Redirect

The **redirect** method add to **res** object for development, and requires implementation in production.

## ClientOnly

Aka vite-ssr, vite-ssr-vue exports ClientOnly component that renders its children only in the browser:

```vue

import { ClientOnly } from "vite-ssr-vue"

<div>
  <ClientOnly>
      <!--- your code  --->
  </ClientOnly>
</div>

```

## Production

Run `vite build` for buildling your app. This will create 2 builds (client and server) that you can import and use from your Node backend.

