# Vue Helmet

[![Coverage Status](https://coveralls.io/repos/github/jnields/vue-helmet/badge.svg?branch=master)](https://coveralls.io/github/jnields/vue-helmet?branch=master)
[![Build Status](https://travis-ci.org/jnields/vue-helmet.svg?branch=master)](https://travis-ci.org/jnields/vue-helmet)

Vue-based head manage solution inspired by [react-helmet](https://github.com/nfl/react-helmet).

## Install

This package requires a `Promise` polyfill to be provided in environments that don't support them natively, and `vue@^2.2.1`

```
npm i -S @jnields/vue-helmet
```

## example
```vue
<template>
    <helmet-provider>
        <div>
            <helmet>
                <meta charSet="utf-8" />
                <title>My Title</title>
                <link rel="canonical" href="http://mysite.com/example" />
            </helmet>
        </div>
    </helmet-provider>
</template>
<script>
import { Helmet } from "@jnields/vue-helmet";

export default {
  name: 'app',
  components: { HelmetProvider, Helmet },
};
</script>
```

Nested or latter components will override duplicate changes:

```vue
<template>
    <Parent>
        <Helmet>
            <title>My Title</title>
            <meta name="description" content="Helmet application" />
        </Helmet>

        <Child>
            <Helmet>
                <title>Nested Title</title>
                <meta name="description" content="Nested component" />
            </Helmet>
        </Child>
    </Parent>
</template>
```

outputs:

```html
<head>
    <title>Nested Title</title>
    <meta name="description" content="Nested component">
</head>
```

See below for a full reference guide.

## Features
- Supports all valid head tags: `title`, `base`, `meta`, `link`, `script`, `noscript`, and `style` tags.
- Supports attributes for `body`, `html` and `title` tags.
- Supports server-side rendering.
- Nested components override duplicate head changes.
- Duplicate head changes are preserved when specified in the same component (support for tags like "apple-touch-icon").
- Callback for tracking DOM changes.

## Server usage

`HelmetProvider` takes an optional `context` prop, of type `Object`, that writes to state.
You can access rendered tags on the server via `context.state.link`, etc.

Assuming `App` passes its context prop along to HelmetProvider (as above), your server would look like this:

```js
// server
import { createRenderer } from 'vue-server-renderer';

const renderer = createRenderer();

app.use(async (req, res, next) => {
  try {
    const context = {};
    const markup = await renderer.renderToString(new App({
      propsData: { context }
    }));
    const helmet = context.state;
    const html = `
      <!doctype html>
      <html ${helmet.htmlAttributes}>
        <head>
          ${helmet.base}
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

### Reference Guide

```vue
<helmet
    {/*
        (optional) used as a fallback when a template exists but a title is not defined

        <helmet
            defaultTitle="My Site"
            titleTemplate="My Site - %s"
        />

        outputs:

        <head>
            <title>My Site</title>
        </head>
    */}
    defaultTitle="My Default Title"

    {/* (optional) callback that tracks DOM changes */}
    onChangeClientState={(newState, addedTags, removedTags) => console.log(newState, addedTags, removedTags)}
>
    {/* html attributes */}
    <html lang="en" amp />

    {/* body attributes */}
    <body className="root" />

    {/* title attributes and value */}
    <title itemProp="name" lang="en">My Plain Title or {`dynamic`} title</title>

    {/* base element */}
    <base target="_blank" href="http://mysite.com/" />

    {/* multiple meta elements */}
    <meta name="description" content="Helmet application" />
    <meta property="og:type" content="article" />

    {/* multiple link elements */}
    <link rel="canonical" href="http://mysite.com/example" />
    <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-57x57.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="http://mysite.com/img/apple-touch-icon-72x72.png" />
    {locales.map((locale) => {
        <link rel="alternate" href="http://example.com/{locale}" hrefLang={locale} />
    })}

    {/* multiple script elements */}
    <script src="http://include.com/pathtojs.js" type="text/javascript" />

    {/* inline script elements */}
    <script type="application/ld+json">{
      JSON.stringify({
        "@context": "http://schema.org"
      })
    }</script>

    {/* noscript elements */}
    <noscript>{`
        <link rel="stylesheet" type="text/css" href="foo.css" />
    `}</noscript>

    {/* inline style elements */}
    <style type="text/css">{`
        body {
            background-color: blue;
        }

        p {
            font-size: 12px;
        }
    `}</style>
</helmet>
```
