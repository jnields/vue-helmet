/** @jsx h */
/* eslint max-nested-callbacks: [1, 7] */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable jsx-a11y/html-has-lang */
/* eslint-env browser */
import Vue from 'vue';
import requestAnimationFrame from 'raf';
import sinon from 'sinon';
import { expect } from 'chai';
import { Helmet, HelmetContext, HelmetProvider } from '../src/index';
import { HELMET_ATTRIBUTE } from '../src/HelmetConstants';

describe('Helmet - Declarative API', () => {
  let headElement;
  const container = document.createElement('div');
  let helmetContext;
  let vm;
  beforeEach(() => {
    headElement =
      headElement || document.head || document.querySelector('head');
    helmetContext = new HelmetContext();
    // resets DOM after each run
    headElement.innerHTML = '';
  });

  function render(renderFunction) {
    const Component = Vue.extend({
      render(h) {
        return (
          <HelmetProvider context={helmetContext}>
            {h({ render: renderFunction })}
          </HelmetProvider>
        );
      },
    });
    vm = new Component();
    vm.$mount(container);
  }

  afterEach(() => {
    if (vm) vm.$destroy();
    vm = undefined;
  });

  describe('api', () => {
    describe('title', () => {
      it('updates page title', (done) => {
        render(h => (
          <Helmet defaultTitle="Fallback">
            <title>Test Title</title>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('Test Title');
          done();
        });
      });

      it('updates page title and allows children containing expressions', (done) => {
        const someValue = 'Some Great Title';

        render(h => (
          <Helmet>
            <title>Title: {someValue}</title>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('Title: Some Great Title');

          done();
        });
      });

      it('updates page title with multiple children', (done) => {
        render(h => (
          <div>
            <Helmet>
              <title>Test Title</title>
            </Helmet>
            <Helmet>
              <title>Child One Title</title>
            </Helmet>
            <Helmet>
              <title>Child Two Title</title>
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('Child Two Title');

          done();
        });
      });

      it('sets title based on deepest nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <title>Main Title</title>
            </Helmet>
            <Helmet>
              <title>Nested Title</title>
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('Nested Title');

          done();
        });
      });

      it('sets title using deepest nested component with a defined title', (done) => {
        render(h => (
          <div>
            <Helmet>
              <title>Main Title</title>
            </Helmet>
            <Helmet />
          </div>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('Main Title');

          done();
        });
      });

      it('uses defaultTitle if no title is defined', (done) => {
        render(h => (
          <Helmet
            defaultTitle="Fallback"
            titleTemplate="This is a %s of the titleTemplate feature"
          >
            <title />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('Fallback');

          done();
        });
      });

      it('uses a titleTemplate if defined', (done) => {
        render(h => (
          <Helmet
            defaultTitle="Fallback"
            titleTemplate="This is a %s of the titleTemplate feature"
          >
            <title>Test</title>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('This is a Test of the titleTemplate feature');

          done();
        });
      });

      it('replaces multiple title strings in titleTemplate', (done) => {
        render(h => (
          <Helmet
            titleTemplate="This is a %s of the titleTemplate feature. Another %s."
          >
            <title>Test</title>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('This is a Test of the titleTemplate feature. Another Test.');

          done();
        });
      });

      it('uses a titleTemplate based on deepest nested component', (done) => {
        render(h => (
          <div>
            <Helmet
              titleTemplate="This is a %s of the titleTemplate feature"
            >
              <title>Test</title>
            </Helmet>
            <Helmet
              titleTemplate="A %s using nested titleTemplate attributes"
            >
              <title>Second Test</title>
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('A Second Test using nested titleTemplate attributes');

          done();
        });
      });

      it('merges deepest component title with nearest upstream titleTemplate', (done) => {
        render(h => (
          <div>
            <Helmet
              titleTemplate="This is a %s of the titleTemplate feature"
            >
              <title>Test</title>
            </Helmet>
            <Helmet>
              <title>Second Test</title>
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('This is a Second Test of the titleTemplate feature');

          done();
        });
      });

      it('renders dollar characters in a title correctly when titleTemplate present', (done) => {
        const dollarTitle = 'te$t te$$t te$$$t te$$$$t';

        render(h => (
          <Helmet titleTemplate="This is a %s">
            <title>{dollarTitle}</title>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('This is a te$t te$$t te$$$t te$$$$t');

          done();
        });
      });

      it('does not encode all characters with HTML character entity equivalents', (done) => {
        const chineseTitle = '膣膗 鍆錌雔';

        render(h => (
          <Helmet>
            <title>{chineseTitle}</title>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal(chineseTitle);

          done();
        });
      });

      it('page title with prop itemProp', (done) => {
        render(h => (
          <Helmet defaultTitle="Fallback">
            <title itemprop="name">Test Title with itemprop</title>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const titleTag = document.getElementsByTagName('title')[0];
          expect(document.title).to.equal('Test Title with itemprop');
          expect(titleTag.getAttribute('itemprop')).to.equal('name');

          done();
        });
      });

      it('retains existing title tag when no title tag is defined', (done) => {
        headElement.innerHTML = '<title>Existing Title</title>';

        render(h => (
          <Helmet>
            <meta name="keywords" content="stuff" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('Existing Title');

          done();
        });
      });

      it('clears title tag if empty title is defined', (done) => {
        render(h => (
          <Helmet>
            <title>Existing Title</title>
            <meta name="keywords" content="stuff" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(document.title).to.equal('Existing Title');

          render(h => (
            <Helmet>
              {h('title', null, '')}
              <meta name="keywords" content="stuff" />
            </Helmet>
          ));

          requestAnimationFrame(() => {
            expect(document.title).to.equal('');
            done();
          });
        });
      });
    });

    describe('title attributes', () => {
      beforeEach(() => {
        headElement.innerHTML = '<title>Test Title</title>';
      });

      it('updates title attributes', (done) => {
        render(h => (
          <Helmet>
            <title itemprop="name" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const titleTag = document.getElementsByTagName('title')[0];

          expect(titleTag.getAttribute('itemprop')).to.equal('name');
          expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('itemprop');

          done();
        });
      });

      it('sets attributes based on the deepest nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <title lang="en" hidden />
            </Helmet>
            <Helmet>
              <title lang="ja" />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const titleTag = document.getElementsByTagName('title')[0];

          expect(titleTag.getAttribute('lang')).to.equal('ja');
          expect(titleTag.getAttribute('hidden')).to.equal('true');
          expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden,lang');

          done();
        });
      });

      it('handles valueless attributes', (done) => {
        render(h => (
          <Helmet>
            <title hidden />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const titleTag = document.getElementsByTagName('title')[0];

          expect(titleTag.getAttribute('hidden')).to.equal('true');
          expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden');

          done();
        });
      });

      it('clears title attributes that are handled within helmet', (done) => {
        render(h => (
          <Helmet>
            <title lang="en" hidden />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => <Helmet><title lang={null} hidden={null} /></Helmet>);

          requestAnimationFrame(() => {
            const titleTag = document.getElementsByTagName('title')[0];

            expect(titleTag.getAttribute('lang')).to.equal(null);
            expect(titleTag.getAttribute('hidden')).to.equal(null);
            expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);

            done();
          });
        });
      });
    });

    describe('html attributes', () => {
      it('updates html attributes', (done) => {
        render(h => (
          <Helmet>
            <html class="myClassName" lang="en" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const htmlTag = document.getElementsByTagName('html')[0];

          expect(htmlTag.getAttribute('class')).to.equal('myClassName');
          expect(htmlTag.getAttribute('lang')).to.equal('en');
          expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('class,lang');

          done();
        });
      });

      it('sets attributes based on the deepest nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <html lang="en" />
            </Helmet>
            <Helmet>
              <html lang="ja" />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const htmlTag = document.getElementsByTagName('html')[0];

          expect(htmlTag.getAttribute('lang')).to.equal('ja');
          expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('lang');

          done();
        });
      });

      it('handles valueless attributes', (done) => {
        render(h => (
          <Helmet>
            <html amp />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const htmlTag = document.getElementsByTagName('html')[0];

          expect(htmlTag.getAttribute('amp')).to.equal('true');
          expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('amp');

          done();
        });
      });

      it('clears html attributes that are handled within helmet', (done) => {
        render(h => (
          <Helmet>
            <html lang="en" amp />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          // eslint-disable-next-line jsx-a11y/lang
          render(h => <Helmet><html lang={null} amp={null} /></Helmet>, container);

          requestAnimationFrame(() => {
            const htmlTag = document.getElementsByTagName('html')[0];

            expect(htmlTag.getAttribute('lang')).to.equal(null);
            expect(htmlTag.getAttribute('amp')).to.equal(null);
            expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);

            done();
          });
        });
      });

      it('updates with multiple additions and removals - overwrite and new', (done) => {
        render(h => (
          <Helmet>
            <html lang="en" amp />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => (
            <Helmet>
              <html lang="ja" id="html-tag" title="html tag" />
            </Helmet>
          ));

          requestAnimationFrame(() => {
            const htmlTag = document.getElementsByTagName('html')[0];

            expect(htmlTag.getAttribute('amp')).to.equal('true');
            expect(htmlTag.getAttribute('lang')).to.equal('ja');
            expect(htmlTag.getAttribute('id')).to.equal('html-tag');
            expect(htmlTag.getAttribute('title')).to.equal('html tag');
            expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('amp,id,lang,title');

            done();
          });
        });
      });

      it('updates with multiple additions and removals - all new', (done) => {
        render(h => (
          <Helmet>
            <html lang="en" amp />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => (
            <Helmet>
              <html id="html-tag" title="html tag" />
            </Helmet>
          ));

          requestAnimationFrame(() => {
            const htmlTag = document.getElementsByTagName('html')[0];

            expect(htmlTag.getAttribute('amp')).to.equal('true');
            expect(htmlTag.getAttribute('lang')).to.equal('en');
            expect(htmlTag.getAttribute('id')).to.equal('html-tag');
            expect(htmlTag.getAttribute('title')).to.equal('html tag');
            expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('amp,id,lang,title');

            done();
          });
        });
      });

      context('initialized outside of helmet', () => {
        before(() => {
          const htmlTag = document.getElementsByTagName('html')[0];
          htmlTag.setAttribute('test', 'test');
        });

        it('are not cleared', (done) => {
          render(h => <Helmet />, container);

          requestAnimationFrame(() => {
            const htmlTag = document.getElementsByTagName('html')[0];

            expect(htmlTag.getAttribute('test')).to.equal('test');
            expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);

            done();
          });
        });

        it('overwritten if specified in helmet', (done) => {
          render(h => (
            <Helmet>
              <html test="helmet-attr" />
            </Helmet>
          ));

          requestAnimationFrame(() => {
            const htmlTag = document.getElementsByTagName('html')[0];

            expect(htmlTag.getAttribute('test')).to.equal('helmet-attr');
            expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('test');

            done();
          });
        });

        it('cleared once it is managed in helmet', (done) => {
          render(h => (
            <Helmet>
              <html test="helmet-attr" />
            </Helmet>
          ));

          requestAnimationFrame(() => {
            render(h => <Helmet><html test={null} /></Helmet>);

            requestAnimationFrame(() => {
              const htmlTag = document.getElementsByTagName('html')[0];

              expect(htmlTag.getAttribute('test')).to.equal(null);
              expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);

              done();
            });
          });
        });
      });
    });

    describe('body attributes', () => {
      context('valid attributes', () => {
        const attributeList = {
          accesskey: 'c',
          class: 'test',
          contenteditable: 'true',
          contextmenu: 'mymenu',
          'data-animal-type': 'lion',
          dir: 'rtl',
          draggable: 'true',
          dropzone: 'copy',
          hidden: 'true',
          id: 'test',
          lang: 'fr',
          spellcheck: 'true',
          style: 'color:green',
          tabindex: '-1',
          title: 'test',
          translate: 'no',
        };

        Object.keys(attributeList).forEach((attribute) => {
          it(attribute, (done) => {
            const attrValue = attributeList[attribute];

            const attrs = {
              [attribute]: attrValue,
            };

            render(h => (
              <Helmet>
                <body {...{ attrs }} />
              </Helmet>
            ));

            requestAnimationFrame(() => {
              const bodyTag = document.body;

              expect(bodyTag.getAttribute(attribute)).to.equal(attrValue);
              expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(attribute);

              done();
            });
          });
        });
      });

      it('updates multiple body attributes', (done) => {
        render(h => (
          <Helmet>
            <body class="myClassName" tabindex={-1} />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const bodyTag = document.body;

          expect(bodyTag.getAttribute('class')).to.equal('myClassName');
          expect(bodyTag.getAttribute('tabindex')).to.equal('-1');
          expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('class,tabindex');

          done();
        });
      });

      it('sets attributes based on the deepest nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <body lang="en" />
            </Helmet>
            <Helmet>
              <body lang="ja" />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const bodyTag = document.body;

          expect(bodyTag.getAttribute('lang')).to.equal('ja');
          expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('lang');

          done();
        });
      });

      it('handles valueless attributes', (done) => {
        render(h => (
          <Helmet>
            <body hidden />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const bodyTag = document.body;

          expect(bodyTag.getAttribute('hidden')).to.equal('true');
          expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden');

          done();
        });
      });

      it('clears body attributes that are handled within helmet', (done) => {
        render(h => (
          <Helmet>
            <body lang="en" hidden />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => <Helmet><body lang={null} hidden={null} /></Helmet>);

          requestAnimationFrame(() => {
            const bodyTag = document.body;

            expect(bodyTag.getAttribute('lang')).to.equal(null);
            expect(bodyTag.getAttribute('hidden')).to.equal(null);
            expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);

            done();
          });
        });
      });

      it('updates with multiple additions and removals - overwrite and new', (done) => {
        render(h => (
          <Helmet>
            <body lang="en" hidden />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => (
            <Helmet>
              <body lang="ja" id="body-tag" title="body tag" />
            </Helmet>
          ));

          requestAnimationFrame(() => {
            const bodyTag = document.body;

            expect(bodyTag.getAttribute('hidden')).to.equal('true');
            expect(bodyTag.getAttribute('lang')).to.equal('ja');
            expect(bodyTag.getAttribute('id')).to.equal('body-tag');
            expect(bodyTag.getAttribute('title')).to.equal('body tag');
            expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden,id,lang,title');

            done();
          });
        });
      });

      it('updates with multiple additions and removals - all new', (done) => {
        render(h => (
          <Helmet>
            <body lang="en" hidden />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => (
            <Helmet>
              <body id="body-tag" title="body tag" />
            </Helmet>
          ));

          requestAnimationFrame(() => {
            const bodyTag = document.body;

            expect(bodyTag.getAttribute('hidden')).to.equal('true');
            expect(bodyTag.getAttribute('lang')).to.equal('en');
            expect(bodyTag.getAttribute('id')).to.equal('body-tag');
            expect(bodyTag.getAttribute('title')).to.equal('body tag');
            expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden,id,lang,title');

            done();
          });
        });
      });

      context('initialized outside of helmet', () => {
        before(() => {
          const bodyTag = document.body;
          bodyTag.setAttribute('test', 'test');
        });

        it('attributes are not cleared', (done) => {
          render(h => <Helmet />);

          requestAnimationFrame(() => {
            const bodyTag = document.body;

            expect(bodyTag.getAttribute('test')).to.equal('test');
            expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);

            done();
          });
        });

        it('attributes are overwritten if specified in helmet', (done) => {
          render(h => (
            <Helmet>
              <body test="helmet-attr" />
            </Helmet>
          ));

          requestAnimationFrame(() => {
            const bodyTag = document.body;

            expect(bodyTag.getAttribute('test')).to.equal('helmet-attr');
            expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('test');

            done();
          });
        });

        it('attributes are cleared once managed in helmet', (done) => {
          render(h => (
            <Helmet>
              <body test="helmet-attr" />
            </Helmet>
          ));

          requestAnimationFrame(() => {
            render(h => <Helmet><body test={null} /></Helmet>, container);

            requestAnimationFrame(() => {
              const bodyTag = document.body;

              expect(bodyTag.getAttribute('test')).to.equal(null);
              expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);

              done();
            });
          });
        });
      });
    });

    describe('handleClientStateChange', () => {
      it('when handling client state change, calls the function with new state, addedTags and removedTags ', (done) => {
        const spy = sinon.spy();
        render(h => (
          <div>
            <Helmet handleClientStateChange={spy}>
              <base href="http://mysite.com/" />
              <link
                href="http://localhost/helmet"
                rel="canonical"
              />
              <meta charset="utf-8" />
              <script
                src="http://localhost/test.js"
                type="text/javascript"
              />
              <title>Main Title</title>
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          expect(spy.called).to.equal(true);
          const newState = spy.getCall(0).args[0];
          const addedTags = spy.getCall(0).args[1];
          const removedTags = spy.getCall(0).args[2];

          expect(newState).to.contain({ title: 'Main Title' });
          expect(newState.baseTag).to.contain({
            href: 'http://mysite.com/',
          });
          expect(newState.metaTags).to.contain({ charset: 'utf-8' });
          expect(newState.linkTags).to.contain({
            href: 'http://localhost/helmet',
            rel: 'canonical',
          });
          expect(newState.scriptTags).to.contain({
            src: 'http://localhost/test.js',
            type: 'text/javascript',
          });

          expect(addedTags).to.have.property('baseTag');
          expect(addedTags.baseTag).to.have.deep.property('[0]');
          expect(addedTags.baseTag[0].outerHTML).to.equal(`<base href="http://mysite.com/" ${HELMET_ATTRIBUTE}="true">`);

          expect(addedTags).to.have.property('metaTags');
          expect(addedTags.metaTags).to.have.deep.property('[0]');
          expect(addedTags.metaTags[0].outerHTML).to.equal(`<meta charset="utf-8" ${HELMET_ATTRIBUTE}="true">`);

          expect(addedTags).to.have.property('linkTags');
          expect(addedTags.linkTags).to.have.deep.property('[0]');
          expect(addedTags.linkTags[0].outerHTML).to.equal(`<link href="http://localhost/helmet" rel="canonical" ${HELMET_ATTRIBUTE}="true">`);

          expect(addedTags).to.have.property('scriptTags');
          expect(addedTags.scriptTags).to.have.deep.property('[0]');
          expect(addedTags.scriptTags[0].outerHTML).to.equal(`<script src="http://localhost/test.js" type="text/javascript" ${HELMET_ATTRIBUTE}="true"></script>`);

          expect(Object.keys(removedTags).length).to.equal(0);

          done();
        });
      });

      it('calls the deepest defined callback with the deepest state', (done) => {
        const spy = sinon.spy();
        render(h => (
          <div>
            <Helmet handleClientStateChange={spy}>
              <title>Main Title</title>
            </Helmet>
            <Helmet>
              <title>Deeper Title</title>
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          expect(spy.callCount).to.equal(1);
          expect(spy.getCall(0).args[0]).to.contain({
            title: 'Deeper Title',
          });

          done();
        });
      });
    });

    describe('base tag', () => {
      it('updates base tag', (done) => {
        render(h => (
          <Helmet>
            <base href="http://mysite.com/" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);

          const filteredTags = [].slice
            .call(existingTags)
            .filter(tag => (
              tag.getAttribute('href') ===
                                'http://mysite.com/'
            ));

          expect(filteredTags.length).to.equal(1);

          done();
        });
      });

      it('clears the base tag if one is not specified', (done) => {
        render(h => (
          <Helmet base={{ href: 'http://mysite.com/' }} />
        ));

        requestAnimationFrame(() => {
          render(h => <Helmet />);

          requestAnimationFrame(() => {
            const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

            expect(existingTags).to.not.equal(undefined);
            expect(existingTags.length).to.equal(0);

            done();
          });
        });
      });

      it("tags without 'href' are not accepted", (done) => {
        render(h => (
          <Helmet>
            <base property="won't work" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });

      it('sets base tag based on deepest nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <base href="http://mysite.com" />
            </Helmet>
            <Helmet>
              <base href="http://mysite.com/public" />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);
          const firstTag = Array.prototype.slice.call(existingTags)[0];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.be.equal(1);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('href')).to.equal('http://mysite.com/public');
          expect(firstTag.outerHTML).to.equal(`<base href="http://mysite.com/public" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('does not render tag when primary attribute is null', (done) => {
        render(h => (
          <Helmet>
            <base href={undefined} />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });
    });

    describe('meta tags', () => {
      it('updates meta tags', (done) => {
        render(h => (
          <Helmet>
            <meta charset="utf-8" />
            <meta name="description" content="Test description" />
            <meta http-equiv="content-type" content="text/html" />
            <meta property="og:type" content="article" />
            <meta itemprop="name" content="Test name itemprop" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);

          expect(existingTags).to.not.equal(undefined);

          const filteredTags = [].slice
            .call(existingTags)
            .filter(tag => (
              tag.getAttribute('charset') === 'utf-8' ||
                                (tag.getAttribute('name') === 'description' &&
                                    tag.getAttribute('content') ===
                                        'Test description') ||
                                (tag.getAttribute('http-equiv') ===
                                    'content-type' &&
                                    tag.getAttribute('content') ===
                                        'text/html') ||
                                (tag.getAttribute('itemprop') === 'name' &&
                                    tag.getAttribute('content') ===
                                        'Test name itemprop')
            ));

          expect(filteredTags.length).to.be.at.least(4);

          done();
        });
      });

      it('does not clear meta tags if none are specified', (done) => {
        render(h => (
          <Helmet>
            <meta name="description" content="Test description" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => <Helmet />, container);

          requestAnimationFrame(() => {
            const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

            expect(existingTags).to.not.equal(undefined);
            expect(existingTags.length).to.equal(1);

            done();
          });
        });
      });

      it("tags without 'name', 'http-equiv', 'property', 'charset', or 'itemprop' are not accepted", (done) => {
        render(h => (
          <Helmet>
            <meta href="won't work" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });

      it('sets meta tags based on deepest nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <meta charset="utf-8" />
              <meta
                name="description"
                content="Test description"
              />
            </Helmet>
            <Helmet>
              <meta
                name="description"
                content="Inner description"
              />
              <meta name="keywords" content="test,meta,tags" />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);

          const firstTag = existingTags[0];
          const secondTag = existingTags[1];
          const thirdTag = existingTags[2];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.be.equal(3);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('charset')).to.equal('utf-8');
          expect(firstTag.outerHTML).to.equal(`<meta charset="utf-8" ${HELMET_ATTRIBUTE}="true">`);

          expect(existingTags).to.have.deep
            .property('[1]')
            .that.is.an.instanceof(Element);
          expect(secondTag).to.have.property('getAttribute');
          expect(secondTag.getAttribute('name')).to.equal('description');
          expect(secondTag.getAttribute('content')).to.equal('Inner description');
          expect(secondTag.outerHTML).to.equal(`<meta name="description" content="Inner description" ${HELMET_ATTRIBUTE}="true">`);

          expect(existingTags).to.have.deep
            .property('[2]')
            .that.is.an.instanceof(Element);
          expect(thirdTag).to.have.property('getAttribute');
          expect(thirdTag.getAttribute('name')).to.equal('keywords');
          expect(thirdTag.getAttribute('content')).to.equal('test,meta,tags');
          expect(thirdTag.outerHTML).to.equal(`<meta name="keywords" content="test,meta,tags" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('allows duplicate meta tags if specified in the same component', (done) => {
        render(h => (
          <Helmet>
            <meta name="description" content="Test description" />
            <meta
              name="description"
              content="Duplicate description"
            />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];
          const secondTag = existingTags[1];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.equal(2);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('name')).to.equal('description');
          expect(firstTag.getAttribute('content')).to.equal('Test description');
          expect(firstTag.outerHTML).to.equal(`<meta name="description" content="Test description" ${HELMET_ATTRIBUTE}="true">`);

          expect(existingTags).to.have.deep
            .property('[1]')
            .that.is.an.instanceof(Element);
          expect(secondTag).to.have.property('getAttribute');
          expect(secondTag.getAttribute('name')).to.equal('description');
          expect(secondTag.getAttribute('content')).to.equal('Duplicate description');
          expect(secondTag.outerHTML).to.equal(`<meta name="description" content="Duplicate description" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('overrides duplicate meta tags with single meta tag in a nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <meta
                name="description"
                content="Test description"
              />
              <meta
                name="description"
                content="Duplicate description"
              />
            </Helmet>
            <Helmet>
              <meta
                name="description"
                content="Inner description"
              />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.equal(1);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('name')).to.equal('description');
          expect(firstTag.getAttribute('content')).to.equal('Inner description');
          expect(firstTag.outerHTML).to.equal(`<meta name="description" content="Inner description" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('overrides single meta tag with duplicate meta tags in a nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <meta
                name="description"
                content="Test description"
              />
            </Helmet>
            <Helmet>
              <meta
                name="description"
                content="Inner description"
              />
              <meta
                name="description"
                content="Inner duplicate description"
              />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];
          const secondTag = existingTags[1];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.equal(2);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('name')).to.equal('description');
          expect(firstTag.getAttribute('content')).to.equal('Inner description');
          expect(firstTag.outerHTML).to.equal(`<meta name="description" content="Inner description" ${HELMET_ATTRIBUTE}="true">`);

          expect(existingTags).to.have.deep
            .property('[1]')
            .that.is.an.instanceof(Element);
          expect(secondTag).to.have.property('getAttribute');
          expect(secondTag.getAttribute('name')).to.equal('description');
          expect(secondTag.getAttribute('content')).to.equal('Inner duplicate description');
          expect(secondTag.outerHTML).to.equal(`<meta name="description" content="Inner duplicate description" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('does not render tag when primary attribute is null', (done) => {
        render(h => (
          <Helmet>
            <meta
              name={undefined}
              content="Inner duplicate description"
            />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });
    });

    describe('link tags', () => {
      it('updates link tags', (done) => {
        render(h => (
          <Helmet>
            <link href="http://localhost/helmet" rel="canonical" />
            <link
              href="http://localhost/style.css"
              rel="stylesheet"
              type="text/css"
            />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);

          expect(existingTags).to.not.equal(undefined);

          const filteredTags = [].slice
            .call(existingTags)
            .filter(tag => (
              (tag.getAttribute('href') ===
                                    'http://localhost/style.css' &&
                                    tag.getAttribute('rel') === 'stylesheet' &&
                                    tag.getAttribute('type') === 'text/css') ||
                                (tag.getAttribute('href') ===
                                    'http://localhost/helmet' &&
                                    tag.getAttribute('rel') === 'canonical')
            ));

          expect(filteredTags.length).to.be.at.least(2);

          done();
        });
      });

      it('does not clear link tags if none are specified', (done) => {
        render(h => (
          <Helmet>
            <link href="http://localhost/helmet" rel="canonical" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => <Helmet />, container);

          requestAnimationFrame(() => {
            const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
            const existingTags = Array.prototype.slice.call(tagNodes);

            expect(existingTags).to.not.equal(undefined);
            expect(existingTags.length).to.equal(1);

            done();
          });
        });
      });

      it("tags without 'href' or 'rel' are not accepted, even if they are valid for other tags", (done) => {
        render(h => (
          <Helmet>
            <link http-equiv="won't work" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });

      it("tags 'rel' and 'href' properly use 'rel' as the primary identification for this tag, regardless of ordering", (done) => {
        render(h => (
          <div>
            <Helmet>
              <link
                href="http://localhost/helmet"
                rel="canonical"
              />
            </Helmet>
            <Helmet>
              <link
                rel="canonical"
                href="http://localhost/helmet/new"
              />
            </Helmet>
            <Helmet>
              <link
                href="http://localhost/helmet/newest"
                rel="canonical"
              />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.equal(1);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('rel')).to.equal('canonical');
          expect(firstTag.getAttribute('href')).to.equal('http://localhost/helmet/newest');
          expect(firstTag.outerHTML).to.equal(`<link href="http://localhost/helmet/newest" rel="canonical" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it("tags with rel='stylesheet' uses the href as the primary identification of the tag, regardless of ordering", (done) => {
        render(h => (
          <div>
            <Helmet>
              <link
                href="http://localhost/style.css"
                rel="stylesheet"
                type="text/css"
                media="all"
              />
            </Helmet>
            <Helmet>
              <link
                rel="stylesheet"
                href="http://localhost/inner.css"
                type="text/css"
                media="all"
              />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];
          const secondTag = existingTags[1];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.equal(2);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('href')).to.equal('http://localhost/style.css');
          expect(firstTag.getAttribute('rel')).to.equal('stylesheet');
          expect(firstTag.getAttribute('type')).to.equal('text/css');
          expect(firstTag.getAttribute('media')).to.equal('all');
          expect(firstTag.outerHTML).to.equal(`<link href="http://localhost/style.css" rel="stylesheet" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`);

          expect(existingTags).to.have.deep
            .property('[1]')
            .that.is.an.instanceof(Element);
          expect(secondTag).to.have.property('getAttribute');
          expect(secondTag.getAttribute('rel')).to.equal('stylesheet');
          expect(secondTag.getAttribute('href')).to.equal('http://localhost/inner.css');
          expect(secondTag.getAttribute('type')).to.equal('text/css');
          expect(secondTag.getAttribute('media')).to.equal('all');
          expect(secondTag.outerHTML).to.equal(`<link rel="stylesheet" href="http://localhost/inner.css" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('sets link tags based on deepest nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <link
                rel="canonical"
                href="http://localhost/helmet"
              />
              <link
                href="http://localhost/style.css"
                rel="stylesheet"
                type="text/css"
                media="all"
              />
            </Helmet>
            <Helmet>
              <link
                rel="canonical"
                href="http://localhost/helmet/innercomponent"
              />
              <link
                href="http://localhost/inner.css"
                rel="stylesheet"
                type="text/css"
                media="all"
              />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];
          const secondTag = existingTags[1];
          const thirdTag = existingTags[2];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.be.at.least(2);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('href')).to.equal('http://localhost/style.css');
          expect(firstTag.getAttribute('rel')).to.equal('stylesheet');
          expect(firstTag.getAttribute('type')).to.equal('text/css');
          expect(firstTag.getAttribute('media')).to.equal('all');
          expect(firstTag.outerHTML).to.equal(`<link href="http://localhost/style.css" rel="stylesheet" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`);

          expect(existingTags).to.have.deep
            .property('[1]')
            .that.is.an.instanceof(Element);
          expect(secondTag).to.have.property('getAttribute');
          expect(secondTag.getAttribute('href')).to.equal('http://localhost/helmet/innercomponent');
          expect(secondTag.getAttribute('rel')).to.equal('canonical');
          expect(secondTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/innercomponent" ${HELMET_ATTRIBUTE}="true">`);

          expect(existingTags).to.have.deep
            .property('[2]')
            .that.is.an.instanceof(Element);
          expect(thirdTag).to.have.property('getAttribute');
          expect(thirdTag.getAttribute('href')).to.equal('http://localhost/inner.css');
          expect(thirdTag.getAttribute('rel')).to.equal('stylesheet');
          expect(thirdTag.getAttribute('type')).to.equal('text/css');
          expect(thirdTag.getAttribute('media')).to.equal('all');
          expect(thirdTag.outerHTML).to.equal(`<link href="http://localhost/inner.css" rel="stylesheet" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('allows duplicate link tags if specified in the same component', (done) => {
        render(h => (
          <Helmet>
            <link rel="canonical" href="http://localhost/helmet" />
            <link
              rel="canonical"
              href="http://localhost/helmet/component"
            />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];
          const secondTag = existingTags[1];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.be.at.least(2);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('rel')).to.equal('canonical');
          expect(firstTag.getAttribute('href')).to.equal('http://localhost/helmet');
          expect(firstTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet" ${HELMET_ATTRIBUTE}="true">`);

          expect(existingTags).to.have.deep
            .property('[1]')
            .that.is.an.instanceof(Element);
          expect(secondTag).to.have.property('getAttribute');
          expect(secondTag.getAttribute('rel')).to.equal('canonical');
          expect(secondTag.getAttribute('href')).to.equal('http://localhost/helmet/component');
          expect(secondTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/component" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('overrides duplicate link tags with a single link tag in a nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <link
                rel="canonical"
                href="http://localhost/helmet"
              />
              <link
                rel="canonical"
                href="http://localhost/helmet/component"
              />
            </Helmet>
            <Helmet>
              <link
                rel="canonical"
                href="http://localhost/helmet/innercomponent"
              />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.be.equal(1);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('rel')).to.equal('canonical');
          expect(firstTag.getAttribute('href')).to.equal('http://localhost/helmet/innercomponent');
          expect(firstTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/innercomponent" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('overrides single link tag with duplicate link tags in a nested component', (done) => {
        render(h => (
          <div>
            <Helmet>
              <link
                rel="canonical"
                href="http://localhost/helmet"
              />
            </Helmet>
            <Helmet>
              <link
                rel="canonical"
                href="http://localhost/helmet/component"
              />
              <link
                rel="canonical"
                href="http://localhost/helmet/innercomponent"
              />
            </Helmet>
          </div>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];
          const secondTag = existingTags[1];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.be.equal(2);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('rel')).to.equal('canonical');
          expect(firstTag.getAttribute('href')).to.equal('http://localhost/helmet/component');
          expect(firstTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/component" ${HELMET_ATTRIBUTE}="true">`);

          expect(existingTags).to.have.deep
            .property('[1]')
            .that.is.an.instanceof(Element);
          expect(secondTag).to.have.property('getAttribute');
          expect(secondTag.getAttribute('rel')).to.equal('canonical');
          expect(secondTag.getAttribute('href')).to.equal('http://localhost/helmet/innercomponent');
          expect(secondTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/innercomponent" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });

      it('does not render tag when primary attribute is null', (done) => {
        render(h => (
          <Helmet>
            <link rel="icon" sizes="192x192" href={null} />
            <link
              rel="canonical"
              href="http://localhost/helmet/component"
            />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.be.equal(1);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('rel')).to.equal('canonical');
          expect(firstTag.getAttribute('href')).to.equal('http://localhost/helmet/component');
          expect(firstTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/component" ${HELMET_ATTRIBUTE}="true">`);

          done();
        });
      });
    });

    describe('script tags', () => {
      it('updates script tags', (done) => {
        const scriptInnerHTML = `
          {
            "@context": "http://schema.org",
            "@type": "NewsArticle",
            "url": "http://localhost/helmet"
          }
        `;
        render(h => (
          <Helmet>
            <script
              src="http://localhost/test.js"
              type="text/javascript"
            />
            <script
              src="http://localhost/test2.js"
              type="text/javascript"
            />
            <script type="application/ld+json">
              {scriptInnerHTML}
            </script>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const existingTags = headElement.getElementsByTagName('script');

          expect(existingTags).to.not.equal(undefined);

          const filteredTags = [].slice
            .call(existingTags)
            .filter(tag => (
              (tag.getAttribute('src') ===
                                    'http://localhost/test.js' &&
                                    tag.getAttribute('type') ===
                                        'text/javascript') ||
                                (tag.getAttribute('src') ===
                                    'http://localhost/test2.js' &&
                                    tag.getAttribute('type') ===
                                        'text/javascript') ||
                                (tag.getAttribute('type') ===
                                    'application/ld+json' &&
                                    tag.innerHTML === scriptInnerHTML)
            ));

          expect(filteredTags.length).to.be.at.least(3);

          done();
        });
      });

      it('does not clear scripts tags if none are specified', (done) => {
        render(h => (
          <Helmet>
            <script
              src="http://localhost/test.js"
              type="text/javascript"
            />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => <Helmet />, container);

          requestAnimationFrame(() => {
            const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

            expect(existingTags).to.not.equal(undefined);
            expect(existingTags.length).to.equal(1);

            done();
          });
        });
      });

      it("tags without 'src' are not accepted", (done) => {
        render(h => (
          <Helmet>
            <script property="won't work" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });

      it('sets script tags based on deepest nested component', (done) => {
        render(h => (
          <div>
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
          </div>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          const firstTag = existingTags[0];
          const secondTag = existingTags[1];

          expect(existingTags).to.not.equal(undefined);

          expect(existingTags.length).to.be.at.least(2);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('src')).to.equal('http://localhost/test.js');
          expect(firstTag.getAttribute('type')).to.equal('text/javascript');
          expect(firstTag.outerHTML).to.equal(`<script src="http://localhost/test.js" type="text/javascript" ${HELMET_ATTRIBUTE}="true"></script>`);

          expect(existingTags).to.have.deep
            .property('[1]')
            .that.is.an.instanceof(Element);
          expect(secondTag).to.have.property('getAttribute');
          expect(secondTag.getAttribute('src')).to.equal('http://localhost/test2.js');
          expect(secondTag.getAttribute('type')).to.equal('text/javascript');
          expect(secondTag.outerHTML).to.equal(`<script src="http://localhost/test2.js" type="text/javascript" ${HELMET_ATTRIBUTE}="true"></script>`);

          done();
        });
      });

      it('sets async value correctly', (done) => {
        render(h => (
          <Helmet>
            <script src="foo.js" async />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const existingTag = headElement.querySelector(`script[${HELMET_ATTRIBUTE}]`);

          expect(existingTag).to.not.equal(undefined);
          expect(existingTag.outerHTML).to.be
            .a('string')
            .that.equals(`<script src="foo.js" async="true" ${HELMET_ATTRIBUTE}="true"></script>`);

          done();
        });
      });

      it('does not render tag when primary attribute (src) is null', (done) => {
        render(h => (
          <Helmet>
            <script src={undefined} type="text/javascript" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });

      it('does not render tag when primary attribute (innerHTML) is null', (done) => {
        render(h => (
          <Helmet>
            <script innerHTML={undefined} />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });
    });

    describe('noscript tags', () => {
      it('updates noscript tags', (done) => {
        const noscriptInnerHTML = '<link rel="stylesheet" type="text/css" href="foo.css" />';
        render(h => (
          <Helmet>
            <noscript id="bar">{noscriptInnerHTML}</noscript>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const existingTags = headElement.getElementsByTagName('noscript');

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(1);
          expect(existingTags[0].innerHTML === noscriptInnerHTML &&
                            existingTags[0].id === 'bar');

          done();
        });
      });

      it('does not clear noscripts tags if none are specified', (done) => {
        render(h => (
          <Helmet>
            <noscript id="bar" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => <Helmet />, container);

          requestAnimationFrame(() => {
            const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

            expect(existingTags).to.not.equal(undefined);
            expect(existingTags.length).to.equal(0);

            done();
          });
        });
      });

      it("tags without 'innerHTML' are not accepted", (done) => {
        render(h => (
          <Helmet>
            <noscript property="won't work" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const existingTags = headElement.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });

      it('does not render tag when primary attribute is null', (done) => {
        render(h => (
          <Helmet>
            <noscript>{undefined}</noscript>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });
    });

    describe('style tags', () => {
      it('updates style tags', (done) => {
        const cssText1 = `
          body {
              background-color: green;
          }
        `;
        const cssText2 = `
          p {
              font-size: 12px;
          }
        `;

        render(h => (
          <Helmet>
            <style type="text/css">{cssText1}</style>
            {h('style', { domProps: { innerHTML: cssText2 } })}
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);

          const [firstTag, secondTag] = existingTags;
          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.be.equal(2);

          expect(existingTags).to.have.deep
            .property('[0]')
            .that.is.an.instanceof(Element);
          expect(firstTag).to.have.property('getAttribute');
          expect(firstTag.getAttribute('type')).to.equal('text/css');
          expect(firstTag.innerHTML).to.equal(cssText1);
          expect(firstTag.outerHTML).to.equal(`<style type="text/css" ${HELMET_ATTRIBUTE}="true">${cssText1}</style>`);

          expect(existingTags).to.have.deep
            .property('[1]')
            .that.is.an.instanceof(Element);
          expect(secondTag.innerHTML).to.equal(cssText2);
          expect(secondTag.outerHTML).to.equal(`<style ${HELMET_ATTRIBUTE}="true">${cssText2}</style>`);

          done();
        });
      });

      it('does not clear style tags if none are specified', (done) => {
        const cssText = `
          body {
              background-color: green;
          }
        `;
        render(h => (
          <Helmet>
            <style type="text/css">{cssText}</style>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          render(h => <Helmet />, container);

          requestAnimationFrame(() => {
            const existingTags = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

            expect(existingTags).to.not.equal(undefined);
            expect(existingTags.length).to.equal(1);

            done();
          });
        });
      });

      it("tags without 'cssText' are not accepted", (done) => {
        render(h => (
          <Helmet>
            <style property="won't work" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const existingTags = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });

      it('does not render tag when primary attribute is null', (done) => {
        render(h => (
          <Helmet>
            <style>{undefined}</style>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          const tagNodes = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);
          expect(existingTags.length).to.equal(0);

          done();
        });
      });
    });
  });

  describe('deferred tags', () => {
    beforeEach(() => {
      window.spy = sinon.spy();
    });

    afterEach(() => {
      delete window.spy;
    });

    it('executes asynchronously', (done) => {
      render(h => (
        <div>
          <Helmet>
            <script>
              window.spy(1)
            </script>
          </Helmet>
        </div>
      ));

      expect(window.spy.callCount).to.equal(0);

      requestAnimationFrame(() => {
        expect(window.spy.callCount).to.equal(1);
        expect(window.spy.args).to.deep.equal([[1]]);
        done();
      });
    });
  });

  describe('misc', () => {
    it('throws in rewind() when a DOM is present', () => {
      render(h => (
        <Helmet>
          <title>Fancy title</title>
        </Helmet>
      ));
      expect(helmetContext.rewind).to.throw('You may only call rewind() on the server. Call peek() to read the current state.');
    });

    it('lets you read current state in peek() when DOM is present', (done) => {
      render(h => (
        <Helmet>
          <title>Fancy title</title>
        </Helmet>
      ));
      requestAnimationFrame(() => {
        expect(helmetContext.peek().title).to.be.equal('Fancy title');
        done();
      });
    });

    it('encodes special characters', (done) => {
      render(h => (
        <Helmet>
          <meta
            name="description"
            content={'This is "quoted" text and & and \'.'}
          />
        </Helmet>
      ));

      requestAnimationFrame(() => {
        const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
        const existingTag = existingTags[0];

        expect(existingTags).to.not.equal(undefined);

        expect(existingTags.length).to.be.equal(1);

        expect(existingTags).to.have.deep
          .property('[0]')
          .that.is.an.instanceof(Element);
        expect(existingTag).to.have.property('getAttribute');
        expect(existingTag.getAttribute('name')).to.equal('description');
        expect(existingTag.getAttribute('content')).to.equal('This is "quoted" text and & and \'.');
        expect(existingTag.outerHTML).to.equal(`<meta name="description" content="This is &quot;quoted&quot; text and &amp; and '." ${HELMET_ATTRIBUTE}="true">`);

        done();
      });
    });

    xit('does not change the DOM if it recevies identical props', (done) => {
      const spy = sinon.spy();
      render(h => (
        <Helmet handleClientStateChange={spy}>
          <meta name="description" content="Test description" />
          <title>Test Title</title>
        </Helmet>
      ));

      requestAnimationFrame(() => {
        // Re-rendering will pass new props to an already mounted Helmet
        render(h => (
          <Helmet handleClientStateChange={spy}>
            <meta name="description" content="Test description" />
            <title>Test Title</title>
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });

    xit('does not write the DOM if the client and server are identical', (done) => {
      headElement.innerHTML = `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript" />`;

      const spy = sinon.spy();
      render(h => (
        <Helmet handleClientStateChange={spy}>
          <script
            src="http://localhost/test.js"
            type="text/javascript"
          />
        </Helmet>
      ));

      requestAnimationFrame(() => {
        expect(spy.called).to.equal(true);

        const [, addedTags, removedTags] = spy.getCall(0).args;

        expect(addedTags.length).to.equal(0);
        expect(removedTags.length).to.equal(0);

        done();
      });
    });

    it('only adds new tags and preserves tags when rendering additional Helmet instances', (done) => {
      const spy = sinon.spy();
      let addedTags;
      let removedTags;
      render(h => (
        <Helmet handleClientStateChange={spy}>
          <link
            href="http://localhost/style.css"
            rel="stylesheet"
            type="text/css"
          />
          <meta name="description" content="Test description" />
        </Helmet>
      ));

      requestAnimationFrame(() => {
        expect(spy.called).to.equal(true);
        ([, addedTags, removedTags] = spy.getCall(0).args);

        expect(addedTags).to.have.property('metaTags');
        expect(addedTags.metaTags).to.have.deep.property('[0]');
        expect(addedTags.metaTags[0].outerHTML).to.equal(`<meta name="description" content="Test description" ${HELMET_ATTRIBUTE}="true">`);
        expect(addedTags).to.have.property('linkTags');
        expect(addedTags.linkTags).to.have.deep.property('[0]');
        expect(addedTags.linkTags[0].outerHTML).to.equal(`<link href="http://localhost/style.css" rel="stylesheet" type="text/css" ${HELMET_ATTRIBUTE}="true">`);
        expect(Object.keys(removedTags).length).to.equal(0);

        // Re-rendering will pass new props to an already mounted Helmet
        render(h => (
          <Helmet handleClientStateChange={spy}>
            <link
              href="http://localhost/style.css"
              rel="stylesheet"
              type="text/css"
            />
            <link
              href="http://localhost/style2.css"
              rel="stylesheet"
              type="text/css"
            />
            <meta name="description" content="New description" />
          </Helmet>
        ));

        requestAnimationFrame(() => {
          expect(spy.callCount).to.equal(2);
          ([, addedTags, removedTags] = spy.getCall(1).args);

          expect(addedTags).to.have.property('metaTags');
          expect(addedTags.metaTags).to.have.deep.property('[0]');
          expect(addedTags.metaTags[0].outerHTML).to.equal(`<meta name="description" content="New description" ${HELMET_ATTRIBUTE}="true">`);
          expect(addedTags).to.have.property('linkTags');
          expect(addedTags.linkTags).to.have.deep.property('[0]');
          expect(addedTags.linkTags[0].outerHTML).to.equal(`<link href="http://localhost/style2.css" rel="stylesheet" type="text/css" ${HELMET_ATTRIBUTE}="true">`);
          expect(removedTags).to.have.property('metaTags');
          expect(removedTags.metaTags).to.have.deep.property('[0]');
          expect(removedTags.metaTags[0].outerHTML).to.equal(`<meta name="description" content="Test description" ${HELMET_ATTRIBUTE}="true">`);
          expect(removedTags).to.not.have.property('linkTags');

          done();
        });
      });
    });

    it('does not accept nested Helmets', (done) => {
      const warn = sinon.stub(console, 'warn');

      render(h => (
        <Helmet>
          <title>Test Title</title>
          <Helmet>
            <title>Title you will never see</title>
          </Helmet>
        </Helmet>
      ));

      requestAnimationFrame(() => {
        expect(document.title).to.equal('Test Title');
        expect(warn.called).to.equal(true);

        const [warning] = warn.getCall(0).args;
        expect(!!warning).to.equal(true);

        warn.restore();

        done();
      });
    });

    it('warns on invalid elements', (done) => {
      const warn = sinon.stub(console, 'warn');

      render(h => (
        <Helmet>
          <title>Test Title</title>
          <div>
            <title>Title you will never see</title>
          </div>
        </Helmet>
      ));

      requestAnimationFrame(() => {
        expect(document.title).to.equal('Test Title');
        expect(warn.called).to.equal(true);

        const [warning] = warn.getCall(0).args;
        expect(warning).to.equal('Only elements types base, body, html, link, meta, noscript, script, style, title are allowed. Helmet does not support rendering <div> elements. Refer to our API for more information.');

        warn.restore();
        done();
      });
    });

    it('warns on invalid self-closing elements', (done) => {
      const warn = sinon.stub(console, 'warn');

      render(h => (
        <Helmet>
          <title>Test Title</title>
          <div customAttribute />
        </Helmet>
      ));

      requestAnimationFrame(() => {
        expect(document.title).to.equal('Test Title');
        expect(warn.called).to.equal(true);

        const [warning] = warn.getCall(0).args;
        expect(warning).to.equal('Only elements types base, body, html, link, meta, noscript, script, style, title are allowed. Helmet does not support rendering <div> elements. Refer to our API for more information.');

        warn.restore();
        done();
      });
    });

    xit('throws on invalid strings as children', () => {
      const renderInvalid = () =>
        render(h => (
          <Helmet>
            <title>Test Title</title>
            <link // eslint-disable-line react/void-dom-elements-no-children
              href="http://localhost/helmet"
              rel="canonical"
            >test
            </link>
          </Helmet>
        ));

      // not sure how to detect error as Vue swallows the error in the render function :?
      expect(renderInvalid).to.throw(
        Error,
        '<link /> elements are self-closing and can not contain children. Refer to our API for more information.',
      );
    });

    xit('throws on invalid children', () => {
      const renderInvalid = () =>
        render(h => (
          <Helmet>
            <title>Test Title</title>
            <script>
              <title>Title you will never see</title>
            </script>
          </Helmet>
        ));

      // not sure how to detect error as Vue swallows the error in the render function :?
      expect(renderInvalid).to.throw(
        Error,
        'Helmet expects a string as a child of <script>. Did you forget to wrap your children in braces? ( <script>{``}</script> ) Refer to our API for more information.',
      );
    });

    it('handles undefined children', (done) => {
      const charSet = undefined;

      render(h => (
        <Helmet>
          {charSet && <meta charSet={charSet} />}
          <title>Test Title</title>
        </Helmet>
      ));

      requestAnimationFrame(() => {
        expect(document.title).to.equal('Test Title');
        done();
      });
    });

    it('recognizes valid tags regardless of attribute ordering', (done) => {
      render(h => (
        <Helmet>
          <meta content="Test Description" name="description" />
        </Helmet>
      ));

      requestAnimationFrame(() => {
        const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
        const existingTag = existingTags[0];

        expect(existingTags).to.not.equal(undefined);

        expect(existingTags.length).to.be.equal(1);

        expect(existingTags).to.have.deep
          .property('[0]')
          .that.is.an.instanceof(Element);
        expect(existingTag).to.have.property('getAttribute');
        expect(existingTag.getAttribute('name')).to.equal('description');
        expect(existingTag.getAttribute('content')).to.equal('Test Description');
        expect(existingTag.outerHTML).to.equal(`<meta content="Test Description" name="description" ${HELMET_ATTRIBUTE}="true">`);

        done();
      });
    });
  });
});
