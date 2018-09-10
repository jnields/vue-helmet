/** @jsx h */
/* eslint max-nested-callbacks: [1, 7] */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable jsx-a11y/html-has-lang */
/* eslint-env node */
import Vue from 'vue';
import { createRenderer } from 'vue-server-renderer';

import { expect } from 'chai';
import { Helmet, HelmetProvider } from '../src/index';
import { HELMET_ATTRIBUTE } from '../src/HelmetConstants';

Vue.config.productionTip = false;

// const serverRendered = 'data-server-rendered="true"';
const stringifiedHtmlAttributes = 'class="myClassName" lang="ga"';
const stringifiedBodyAttributes = 'class="myClassName" lang="ga"';
const stringifiedTitle = `<title ${HELMET_ATTRIBUTE}="true">Dangerous &lt;script&gt; include</title>`;
const unEncodedStringifiedTitle = `<title ${HELMET_ATTRIBUTE}="true">This is text and & and '.</title>`;
const stringifiedTitleWithItemprop = `<title ${HELMET_ATTRIBUTE}="true" itemprop="name">Title with Itemprop</title>`;
const stringifiedTitleWithTitleExpression = `<title ${HELMET_ATTRIBUTE}="true">Title: Some Great Title</title>`;
const stringifiedBaseTag = `<base ${HELMET_ATTRIBUTE}="true" target="_blank" href="http://localhost/"/>`;

const stringifiedMetaTags = [
  `<meta ${HELMET_ATTRIBUTE}="true" charset="utf-8"/>`,
  `<meta ${HELMET_ATTRIBUTE}="true" name="description" content="Test description &amp; encoding of special characters like &#39; &quot; &gt; &lt; \`"/>`,
  `<meta ${HELMET_ATTRIBUTE}="true" http-equiv="content-type" content="text/html"/>`,
  `<meta ${HELMET_ATTRIBUTE}="true" property="og:type" content="article"/>`,
  `<meta ${HELMET_ATTRIBUTE}="true" itemprop="name" content="Test name itemprop"/>`,
].join('');

const stringifiedLinkTags = [
  `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/helmet" rel="canonical"/>`,
  `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/style.css" rel="stylesheet" type="text/css"/>`,
].join('');

const stringifiedScriptTags = [
  `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript"></script>`,
  `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test2.js" type="text/javascript"></script>`,
].join('');

const stringifiedNoscriptTags = [
  `<noscript ${HELMET_ATTRIBUTE}="true" id="foo"><link rel="stylesheet" type="text/css" href="/style.css" /></noscript>`,
  `<noscript ${HELMET_ATTRIBUTE}="true" id="bar"><link rel="stylesheet" type="text/css" href="/style2.css" /></noscript>`,
].join('');

const stringifiedStyleTags = [
  `<style ${HELMET_ATTRIBUTE}="true" type="text/css">body {background-color: green;}</style>`,
  `<style ${HELMET_ATTRIBUTE}="true" type="text/css">p {font-size: 12px;}</style>`,
].join('');


describe('server', () => {
  const renderer = createRenderer();
  let staticContext;
  let vm;

  beforeEach(() => {
    staticContext = {};
  });

  function render(renderFunction) {
    const Component = Vue.extend({
      render(h) {
        return (
          <HelmetProvider context={staticContext}>
            {h({ render: renderFunction })}
          </HelmetProvider>
        );
      },
    });
    vm = new Component();
    return renderer.renderToString(vm);
  }

  it('encodes special characters in title', async () => {
    await render(h => (
      <Helmet>
        <title>{'Dangerous <script> include'}</title>
      </Helmet>
    ));
    const head = staticContext.state;
    expect(head.title).to.equal(stringifiedTitle);
  });

  xit('opts out of string encoding', () => {
    const rawTitle = 'This is text and & and \'.';
    render(h => (
      <Helmet encodeSpecialCharacters={false}>
        <title>{rawTitle}</title>
      </Helmet>
    ));
    const head = staticContext.state;
    expect(head.title).to.equal(unEncodedStringifiedTitle);
  });

  it('renders title with itemprop name', async () => {
    await render(h => (
      <Helmet>
        <title itemprop="name">Title with Itemprop</title>
      </Helmet>
    ));
    const head = staticContext.state;
    expect(head.title).to.be
      .a('string')
      .that.equals(stringifiedTitleWithItemprop);
  });

  it('renders base tag', async () => {
    await render(h => (
      <Helmet>
        <base target="_blank" href="http://localhost/" />
      </Helmet>
    ));
    const head = staticContext.state;
    expect(head.base).to.be
      .a('string')
      .that.equals(stringifiedBaseTag);
  });

  it('renders meta tags', async () => {
    await render(h => (
      <Helmet>
        <meta charset="utf-8" />
        <meta
          name="description"
          content={"Test description & encoding of special characters like ' \" > < `"}
        />
        <meta http-equiv="content-type" content="text/html" />
        <meta property="og:type" content="article" />
        <meta itemprop="name" content="Test name itemprop" />
      </Helmet>
    ));
    const head = staticContext.state;
    expect(head.meta).to.be
      .a('string')
      .that.equals(stringifiedMetaTags);
  });

  it('renders link tags', async () => {
    await render(h => (
      <Helmet>
        <link href="http://localhost/helmet" rel="canonical" />
        <link
          href="http://localhost/style.css"
          rel="stylesheet"
          type="text/css"
        />
      </Helmet>
    ));

    const head = staticContext.state;
    expect(head.link).to.be
      .a('string')
      .that.equals(stringifiedLinkTags);
  });

  it('renders script tags', async () => {
    await render(h => (
      <Helmet>
        <script
          src="http://localhost/test.js"
          type="text/javascript"
        />
        <script
          src="http://localhost/test2.js"
          type="text/javascript"
        />
      </Helmet>
    ));

    const head = staticContext.state;
    expect(head.script).to.be
      .a('string')
      .that.equals(stringifiedScriptTags);
  });

  it('renders noscript tags', async () => {
    await render(h => (
      <Helmet>
        <noscript id="foo">{'<link rel="stylesheet" type="text/css" href="/style.css" />'}</noscript>
        <noscript id="bar">{'<link rel="stylesheet" type="text/css" href="/style2.css" />'}</noscript>
      </Helmet>
    ));

    const head = staticContext.state;
    expect(head.noscript).to.be
      .a('string')
      .that.equals(stringifiedNoscriptTags);
  });

  it('renders style tags', async () => {
    await render(h => (
      <Helmet>
        <style type="text/css">{'body {background-color: green;}'}</style>
        <style type="text/css">{'p {font-size: 12px;}'}</style>
      </Helmet>
    ));
    const head = staticContext.state;
    expect(head.style).to.be
      .a('string')
      .that.equals(stringifiedStyleTags);
  });

  it('renders title tag', async () => {
    await render(h => (
      <Helmet>
        <title>{'Dangerous <script> include'}</title>
      </Helmet>
    ));
    const head = staticContext.state;
    expect(head.title).to.be
      .a('string')
      .that.equals(stringifiedTitle);
  });

  it('renders title and allows children containing expressions', async () => {
    const someValue = 'Some Great Title';

    await render(h => (
      <Helmet>
        <title>
          Title:
          {' '}
          {someValue}
        </title>
      </Helmet>
    ));

    const head = staticContext.state;

    expect(head.title).to.be
      .a('string')
      .that.equals(stringifiedTitleWithTitleExpression);
  });

  it('renders title with itemprop name as string', async () => {
    render(h => (
      <Helmet>
        <title itemprop="name">Title with Itemprop</title>
      </Helmet>
    ));
    const head = staticContext.state;
    expect(head.title).to.be
      .a('string')
      .that.equals(stringifiedTitleWithItemprop);
  });

  it('renders html attributes', async () => {
    render(h => (
      <Helmet>
        <html lang="ga" class="myClassName" />
      </Helmet>
    ));

    const { htmlAttributes } = staticContext.state;
    expect(htmlAttributes).to.be
      .a('string')
      .that.equals(stringifiedHtmlAttributes);
  });

  xit('renders html attributes as object', () => {
    // TODO how should API look?
  });

  xit('renders body attributes as object', () => {
    // TODO how should API look?
  });

  it('renders body attributes as string', async () => {
    await render(h => (
      <Helmet>
        <body lang="ga" class="myClassName" />
      </Helmet>
    ));
    const { bodyAttributes } = staticContext.state;
    expect(bodyAttributes).to.be
      .a('string')
      .that.equals(stringifiedBodyAttributes);
  });

  it('does not encode all characters with HTML character entity equivalents', () => {
    const chineseTitle = '膣膗 鍆錌雔';
    const stringifiedChineseTitle = `<title ${HELMET_ATTRIBUTE}="true">${chineseTitle}</title>`;

    render(h => (
      <div>
        <Helmet>
          <title>{chineseTitle}</title>
        </Helmet>
      </div>
    ));

    const head = staticContext.state;

    expect(head.title).to.be
      .a('string')
      .that.equals(stringifiedChineseTitle);
  });

  it('provides a fallback object for empty Helmet state', async () => {
    await render(h => <div />);

    const head = staticContext.state;

    expect(head.htmlAttributes).to.equal('');
    expect(head.title).to.equal(`<title ${HELMET_ATTRIBUTE}="true"></title>`);
    expect(head.base).to.equal('');
    expect(head.meta).to.equal('');
    expect(head.link).to.equal('');
    expect(head.script).to.equal('');
    expect(head.noscript).to.equal('');
    expect(head.style).to.equal('');
  });

  it('does not render undefined attribute values', () => {
    render(h => (
      <Helmet>
        <script src="foo.js" async={undefined} />
      </Helmet>
    ));

    const { script } = staticContext.state;
    expect(script).to.be
      .a('string')
      .that.equals(`<script ${HELMET_ATTRIBUTE}="true" src="foo.js" async></script>`);
  });
});
