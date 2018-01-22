# Vue Helmet

[![Coverage Status](https://coveralls.io/repos/github/jnields/vue-helmet/badge.svg?branch=master)](https://coveralls.io/github/jnields/vue-helmet?branch=master)
[![Build Status](https://travis-ci.org/jnields/vue-helmet.svg?branch=master)](https://travis-ci.org/jnields/vue-helmet)

Vue-based solution inspired by [react-helmet](https://github.com/nfl/react-helmet).

## Install

```
npm i -S @jnields/vue-helmet
```

## Differences from [react-helmet](https://github.com/nfl/react-helmet)

### 1) Requires context to be provided via a `<HelmetProvider />`

A `<HelmetProvider />` component must be rendered as an ancestor to any helmet instances and provided a context prop. `context.rewind()` is available on the server in lieu of `Helmet.renderStatic()` or `Helmet.rewind()` (see usage)

> WHY? React’s server-side rendering is synchronous, which allows tracking of rendered component instances per `renderToString` call at the class level. Because Vue’s server-side rendering is _asynchronous_, several `renderToString` calls may interact with a class-level identifier at the same time, which makes it necessary to track components with something unique to each `renderToString` call.

### 2) Child `<Helmet/>`s will not clear parent `<Helmet/>`s’ tags

Rendering a [react-helmet](https://github.com/nfl/react-helmet) without any link tags will clear link tags if a parent component had rendered them. This is not the case for this package. Instead, this package will override tags based on their primary attribute (e.g. rel for link tags).

### 3) Child `<Helmet/>`s will not clear any html, title, or body attributes defined by parent `<Helmet/>`s by default

However, Explicitly setting an attribute to `null` will clear it.

### 4) Only offers rendering to string on the server

[react-helmet](https://github.com/nfl/react-helmet) offers both `toComponent()` and `toString()` methods on the server. This package does not offer a method but rather provides the rendered tags as a string property on the result of `context.rewind()`. (see usage)

### 5) Only the declarative API is supported

You may use the props `defaultTitle`, `titleTemplate`, and `handleClientStateChange` on the `<Helmet/>` instance. No other props are supported. You must instead use the declarative API (i.e. by rendering tags within a `<Helmet />`).

## Usage

```js
// app.js
import Vue from 'vue';
import Helmet, { HelmetContext, HelmetProvider } from '@jnields/vue-helmet';

export default Vue.extend({
  name: 'app',
  props: {
    context: {
      type: HelmetContext,
      required: true,
    },
    handleClientStateChange: Function,
  },
  render() {
    return (
      <HelmetProvider context={this.$props.context}>
        <div>
          <h1>Example App</h1>
          <Helmet
            titleTemplate="REI - %s"
            defaultTitle="Outdoor Clothing, Gear and Footwear from Top Brands"
            handleClientStateChange={this.handleClientStateChange}
          >
            <html lang="en" />
            <title lang="en">My Title</title>
            <meta charset="utf-8" />
            <link rel="canonical" href="http://mysite.com/example" />
            <body class="noscroll" />
            <noscript>{`<style>.jsonly{display:none}</style>`}</noscript>
            <script src="/utag.js" async />
           </Helmet>
        </div>
      </HelmetProvider>
    );
  }
});
```

```js
// browser
import Vue from 'vue';
import { HelmetContext } from '@jnields/vue-helmet';

const context = new HelmetContext();
new App({ propsData: { context } }).$mount(document.getElementById('root'));
```

```js
// server
import { createRenderer } from 'vue-server-renderer';
import { HelmetContext } from '@jnields/vue-helmet';

const renderer = createRenderer();

app.use(async (req, res, next) => {
  try {
    const context = new HelmetContext();
    const markup = await renderer.renderToString(new App({
      propsData: { context }
    }));
    const helmet = context.rewind();
    const html = `
      <!doctype html>
      <html ${helmet.htmlAttributes}>
        <head>
          ${helmet.link}
          ${helmet.meta}
          ${helmet.noscript}
          ${helmet.script}
          ${helmet.style}
          ${helmet.title}
        </head>
        <body ${helmet.bodyAttributes}>
          <div id="root">
            ${markup}
          </div>
        </body>
      </html>
    `;
    res.end(html);    
  } catch (e) {
    next(e);
  }
});

```
