/** @jsx h */
/* eslint-env browser */
/* eslint max-nested-callbacks: [1, 7] */
/* eslint-disable jsx-a11y/html-has-lang */
import Promise from '@babel/runtime/core-js/promise';
import Vue from 'vue';
import sinon from 'sinon';
import { assert, expect } from 'chai';
import { Helmet, HelmetProvider } from '../src/index';
import { HELMET_ATTRIBUTE } from '../src/HelmetConstants';

Vue.config.productionTip = false;

window.Promise = Promise; // needed for PhantomJS

describe('Helmet - Declarative API', () => {
  let headElement;
  const container = document.createElement('div');
  let vm;
  let staticContext;
  beforeEach(() => {
    headElement =
      headElement || document.head || document.querySelector('head');
    // resets DOM after each run
    headElement.innerHTML = '';
  });

  function render(renderFunction, errorCaptured) {
    staticContext = {};
    const Component = Vue.extend({
      errorCaptured,
      render(h) {
        return (
          <HelmetProvider context={staticContext}>
            {h({ render: renderFunction })}
          </HelmetProvider>
        );
      },
    });
    vm = new Component();
    vm.$mount(container);
    return vm.$nextTick().then(() => vm.$nextTick());
  }

  function rerender() {
    vm.$forceUpdate();
    return vm.$nextTick().then(() => vm.$nextTick());
  }

  afterEach((done) => {
    if (vm) {
      vm.$destroy();
      vm = undefined;
      Vue.nextTick(done);
    } else {
      vm = undefined;
      done();
    }
  });

  describe('api', () => {
    describe('title', () => {
      it('updates page title', () => render(h => (
        <Helmet defaultTitle="Fallback">
          <title>Test Title</title>
        </Helmet>
      )).then(() => {
        expect(document.title).to.equal('Test Title');
      }));

      it('updates page title and allows children containing expressions', () => {
        const someValue = 'Some Great Title';

        return render(h => (
          <Helmet>
            <title>Title: {someValue}</title>
          </Helmet>
        )).then(() => {
          expect(document.title).to.equal('Title: Some Great Title');
        });
      });

      it('updates page title with multiple children', () => render(h => (
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
      )).then(() => {
        expect(document.title).to.equal('Child Two Title');
      }));

      it('sets title based on deepest nested component', () => render(h => (
        <div>
          <Helmet>
            <title>Main Title</title>
          </Helmet>
          <Helmet>
            <title>Nested Title</title>
          </Helmet>
        </div>
      )).then(() => {
        expect(document.title).to.equal('Nested Title');
      }));

      it('sets title using deepest nested component with a defined title', () => render(h => (
        <div>
          <Helmet>
            <title>Main Title</title>
          </Helmet>
          <Helmet />
        </div>
      )).then(() => {
        expect(document.title).to.equal('Main Title');
      }));

      it('uses defaultTitle if no title is defined', () => render(h => (
        <Helmet
          defaultTitle="Fallback"
          titleTemplate="This is a %s of the titleTemplate feature"
        >
          <title />
        </Helmet>
      )).then(() => {
        expect(document.title).to.equal('Fallback');
      }));

      it('uses a titleTemplate if defined', () => render(h => (
        <Helmet
          defaultTitle="Fallback"
          titleTemplate="This is a %s of the titleTemplate feature"
        >
          <title>Test</title>
        </Helmet>
      )).then(() => {
        expect(document.title).to.equal('This is a Test of the titleTemplate feature');
      }));

      it('replaces multiple title strings in titleTemplate', () => render(h => (
        <Helmet
          titleTemplate="This is a %s of the titleTemplate feature. Another %s."
        >
          <title>Test</title>
        </Helmet>
      )).then(() => {
        expect(document.title).to.equal('This is a Test of the titleTemplate feature. Another Test.');
      }));

      it('uses a titleTemplate based on deepest nested component', () => render(h => (
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
      )).then(() => {
        expect(document.title).to.equal('A Second Test using nested titleTemplate attributes');
      }));

      it('merges deepest component title with nearest upstream titleTemplate', () => render(h => (
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
      )).then(() => {
        expect(document.title).to.equal('This is a Second Test of the titleTemplate feature');
      }));

      it('return renders dollar characters in a title correctly when titleTemplate present', () => {
        const dollarTitle = 'te$t te$$t te$$$t te$$$$t';

        return render(h => (
          <Helmet titleTemplate="This is a %s">
            <title>{dollarTitle}</title>
          </Helmet>
        )).then(() => {
          expect(document.title).to.equal('This is a te$t te$$t te$$$t te$$$$t');
        });
      });

      it('does not encode all characters with HTML character entity equivalents', () => {
        const chineseTitle = '膣膗 鍆錌雔';

        return render(h => (
          <Helmet>
            <title>{chineseTitle}</title>
          </Helmet>
        )).then(() => {
          expect(document.title).to.equal(chineseTitle);
        });
      });

      it('page title with prop itemProp', () => render(h => (
        <Helmet defaultTitle="Fallback">
          <title itemprop="name">Test Title with itemprop</title>
        </Helmet>
      )).then(() => {
        const titleTag = document.getElementsByTagName('title')[0];
        expect(document.title).to.equal('Test Title with itemprop');
        expect(titleTag.getAttribute('itemprop')).to.equal('name');
      }));

      it('retains existing title tag when no title tag is defined', () => {
        headElement.innerHTML = '<title>Existing Title</title>';

        return render(h => (
          <Helmet>
            <meta name="keywords" content="stuff" />
          </Helmet>
        )).then(() => {
          expect(document.title).to.equal('Existing Title');
        });
      });

      it('clears title tag if empty title is defined', () => render(h => (
        <Helmet>
          <title>Existing Title</title>
          <meta name="keywords" content="stuff" />
        </Helmet>
      )).then(() => {
        expect(document.title).to.equal('Existing Title');

        return render(h => (
          <Helmet>
            {h('title', null, '')}
            <meta name="keywords" content="stuff" />
          </Helmet>
        )).then(() => {
          expect(document.title).to.equal('');
        });
      }));
    });

    describe('title attributes', () => {
      beforeEach(() => {
        headElement.innerHTML = '<title>Test Title</title>';
      });

      it('updates title attributes', () => render(h => (
        <Helmet>
          <title itemprop="name" />
        </Helmet>
      )).then(() => {
        const titleTag = document.getElementsByTagName('title')[0];

        expect(titleTag.getAttribute('itemprop')).to.equal('name');
        expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('itemprop');
      }));

      it('sets attributes based on the deepest nested component', () => render(h => (
        <div>
          <Helmet>
            <title lang="en" hidden />
          </Helmet>
          <Helmet>
            <title lang="ja" />
          </Helmet>
        </div>
      )).then(() => {
        const titleTag = document.getElementsByTagName('title')[0];

        expect(titleTag.getAttribute('lang')).to.equal('ja');
        expect(titleTag.getAttribute('hidden')).to.equal('true');
        expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden,lang');
      }));

      it('handles valueless attributes', () => render(h => (
        <Helmet>
          <title hidden />
        </Helmet>
      )).then(() => {
        const titleTag = document.getElementsByTagName('title')[0];

        expect(titleTag.getAttribute('hidden')).to.equal('true');
        expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden');
      }));

      it('clears title attributes that are handled within helmet', () => render(h => (
        <Helmet>
          <title lang="en" hidden />
        </Helmet>
      )).then(() => render(h => <Helmet><title lang={null} hidden={null} /></Helmet>).then(() => {
        const titleTag = document.getElementsByTagName('title')[0];

        expect(titleTag.getAttribute('lang')).to.equal(null);
        expect(titleTag.getAttribute('hidden')).to.equal(null);
        expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
      })));
    });

    describe('html attributes', () => {
      it('updates html attributes', () => render(h => (
        <Helmet>
          <html class="myClassName" lang="en" />
        </Helmet>
      )).then(() => {
        const htmlTag = document.getElementsByTagName('html')[0];

        expect(htmlTag.getAttribute('class')).to.equal('myClassName');
        expect(htmlTag.getAttribute('lang')).to.equal('en');
        expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('class,lang');
      }));

      it('sets attributes based on the deepest nested component', () => render(h => (
        <div>
          <Helmet>
            <html lang="en" />
          </Helmet>
          <Helmet>
            <html lang="ja" />
          </Helmet>
        </div>
      )).then(() => {
        const htmlTag = document.getElementsByTagName('html')[0];

        expect(htmlTag.getAttribute('lang')).to.equal('ja');
        expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('lang');
      }));

      it('handles valueless attributes', () => render(h => (
        <Helmet>
          <html amp />
        </Helmet>
      )).then(() => {
        const htmlTag = document.getElementsByTagName('html')[0];

        expect(htmlTag.getAttribute('amp')).to.equal('true');
        expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('amp');
      }));

      it('clears html attributes that are handled within helmet', () => render(h => (
        <Helmet>
          <html lang="en" amp />
        </Helmet>
      )).then(() =>
      // eslint-disable-next-line jsx-a11y/lang
        render(h => <Helmet><html lang={null} amp={null} /></Helmet>, container).then(() => {
          const htmlTag = document.getElementsByTagName('html')[0];

          expect(htmlTag.getAttribute('lang')).to.equal(null);
          expect(htmlTag.getAttribute('amp')).to.equal(null);
          expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
        })));

      it('updates with multiple additions and removals - overwrite and new', () => {
        const data = { updated: false };
        return render(h => (
          <Helmet>
            <html lang="en" amp />
            {data.updated && <html lang="ja" id="html-tag" title="html tag" />}
          </Helmet>
        )).then(() => {
          data.updated = true;
          return rerender();
        }).then(() => {
          const htmlTag = document.getElementsByTagName('html')[0];

          expect(htmlTag.getAttribute('amp')).to.equal('true');
          expect(htmlTag.getAttribute('lang')).to.equal('ja');
          expect(htmlTag.getAttribute('id')).to.equal('html-tag');
          expect(htmlTag.getAttribute('title')).to.equal('html tag');
          expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('amp,id,lang,title');
        });
      });

      it('updates with multiple additions and removals - all new', () => {
        const data = { updated: false };
        return render(h => (
          <Helmet>
            <html lang="en" amp />
            {data.updated && <html id="html-tag" title="html tag" />}
          </Helmet>
        )).then(() => {
          data.updated = true;
          return rerender();
        }).then(() => {
          const htmlTag = document.getElementsByTagName('html')[0];

          expect(htmlTag.getAttribute('amp')).to.equal('true');
          expect(htmlTag.getAttribute('lang')).to.equal('en');
          expect(htmlTag.getAttribute('id')).to.equal('html-tag');
          expect(htmlTag.getAttribute('title')).to.equal('html tag');
          expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('amp,id,lang,title');
        });
      });

      context('initialized outside of helmet', () => {
        before(() => {
          const htmlTag = document.getElementsByTagName('html')[0];
          htmlTag.setAttribute('test', 'test');
        });

        it('are not cleared', () => render(h => <Helmet />, container).then(() => {
          const htmlTag = document.getElementsByTagName('html')[0];

          expect(htmlTag.getAttribute('test')).to.equal('test');
          expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
        }));

        it('overwritten if specified in helmet', () => render(h => (
          <Helmet>
            <html test="helmet-attr" />
          </Helmet>
        )).then(() => {
          const htmlTag = document.getElementsByTagName('html')[0];

          expect(htmlTag.getAttribute('test')).to.equal('helmet-attr');
          expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('test');
        }));

        it('cleared once it is managed in helmet', () => render(h => (
          <Helmet>
            <html test="helmet-attr" />
          </Helmet>
        )).then(() => render(h => <Helmet><html test={null} /></Helmet>).then(() => {
          const htmlTag = document.getElementsByTagName('html')[0];

          expect(htmlTag.getAttribute('test')).to.equal(null);
          expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
        })));
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
          it(attribute, () => {
            const attrValue = attributeList[attribute];

            const attrs = {
              [attribute]: attrValue,
            };

            return render(h => (
              <Helmet>
                <body {...{ attrs }} />
              </Helmet>
            )).then(() => {
              const bodyTag = document.body;

              expect(bodyTag.getAttribute(attribute)).to.equal(attrValue);
              expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(attribute);
            });
          });
        });
      });

      it('updates multiple body attributes', () => render(h => (
        <Helmet>
          <body class="myClassName" tabindex={-1} />
        </Helmet>
      )).then(() => {
        const bodyTag = document.body;

        expect(bodyTag.getAttribute('class')).to.equal('myClassName');
        expect(bodyTag.getAttribute('tabindex')).to.equal('-1');
        expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('class,tabindex');
      }));

      it('sets attributes based on the deepest nested component', () => render(h => (
        <div>
          <Helmet>
            <body lang="en" />
          </Helmet>
          <Helmet>
            <body lang="ja" />
          </Helmet>
        </div>
      )).then(() => {
        const bodyTag = document.body;

        expect(bodyTag.getAttribute('lang')).to.equal('ja');
        expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('lang');
      }));

      it('handles valueless attributes', () => render(h => (
        <Helmet>
          <body hidden />
        </Helmet>
      )).then(() => {
        const bodyTag = document.body;

        expect(bodyTag.getAttribute('hidden')).to.equal('true');
        expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden');
      }));

      it('clears body attributes that are handled within helmet', () => render(h => (
        <Helmet>
          <body lang="en" hidden />
        </Helmet>
      )).then(() => render(h => <Helmet><body lang={null} hidden={null} /></Helmet>).then(() => {
        const bodyTag = document.body;

        expect(bodyTag.getAttribute('lang')).to.equal(null);
        expect(bodyTag.getAttribute('hidden')).to.equal(null);
        expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
      })));

      it('updates with multiple additions and removals - overwrite and new', () => {
        const data = { updated: false };
        return render(h => (
          <Helmet>
            <body lang="en" hidden />
            {data.updated && <body lang="ja" id="body-tag" title="body tag" />}
          </Helmet>
        )).then(() => {
          data.updated = true;
          return rerender();
        }).then(() => {
          const bodyTag = document.body;

          expect(bodyTag.getAttribute('hidden')).to.equal('true');
          expect(bodyTag.getAttribute('lang')).to.equal('ja');
          expect(bodyTag.getAttribute('id')).to.equal('body-tag');
          expect(bodyTag.getAttribute('title')).to.equal('body tag');
          expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden,id,lang,title');
        });
      });

      it('updates with multiple additions and removals - all new', () => {
        const data = { updated: false };
        return render(h => (
          <Helmet>
            <body lang="en" hidden />
            {data.updated && <body id="body-tag" title="body tag" />}
          </Helmet>
        )).then(() => {
          data.updated = true;
          return rerender();
        }).then(() => {
          const bodyTag = document.body;

          expect(bodyTag.getAttribute('hidden')).to.equal('true');
          expect(bodyTag.getAttribute('lang')).to.equal('en');
          expect(bodyTag.getAttribute('id')).to.equal('body-tag');
          expect(bodyTag.getAttribute('title')).to.equal('body tag');
          expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('hidden,id,lang,title');
        });
      });

      context('initialized outside of helmet', () => {
        before(() => {
          const bodyTag = document.body;
          bodyTag.setAttribute('test', 'test');
        });

        it('attributes are not cleared', () => render(h => <Helmet />).then(() => {
          const bodyTag = document.body;

          expect(bodyTag.getAttribute('test')).to.equal('test');
          expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
        }));

        it('attributes are overwritten if specified in helmet', () => render(h => (
          <Helmet>
            <body test="helmet-attr" />
          </Helmet>
        )).then(() => {
          const bodyTag = document.body;

          expect(bodyTag.getAttribute('test')).to.equal('helmet-attr');
          expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal('test');
        }));

        it('attributes are cleared once managed in helmet', () => render(h => (
          <Helmet>
            <body test="helmet-attr" />
          </Helmet>
        )).then(() => render(h => <Helmet><body test={null} /></Helmet>, container).then(() => {
          const bodyTag = document.body;

          expect(bodyTag.getAttribute('test')).to.equal(null);
          expect(bodyTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
        })));
      });
    });

    describe('handleClientStateChange', () => {
      it('when handling client state change, calls the function with new state, addedTags and removedTags ', () => {
        const spy = sinon.spy();
        return render(h => (
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
        )).then(() => {
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
        });
      });

      it('calls the deepest defined callback with the deepest state', () => {
        const spy = sinon.spy();
        return render(h => (
          <div>
            <Helmet handleClientStateChange={spy}>
              <title>Main Title</title>
            </Helmet>
            <Helmet>
              <title>Deeper Title</title>
            </Helmet>
          </div>
        )).then(() => {
          expect(spy.callCount).to.equal(1);
          expect(spy.getCall(0).args[0]).to.contain({
            title: 'Deeper Title',
          });
        });
      });
    });

    describe('base tag', () => {
      it('updates base tag', () => render(h => (
        <Helmet>
          <base href="http://mysite.com/" />
        </Helmet>
      )).then(() => {
        const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);

        const filteredTags = [].slice
          .call(existingTags)
          .filter(tag => (
            tag.getAttribute('href') ===
                                'http://mysite.com/'
          ));

        expect(filteredTags.length).to.equal(1);
      }));

      it('clears the base tag if one is not specified', () => render(h => (
        <Helmet base={{ href: 'http://mysite.com/' }} />
      )).then(() => render(h => <Helmet />).then(() => {
        const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
      })));

      it("tags without 'href' are not accepted", () => render(h => (
        <Helmet>
          <base property="won't work" />
        </Helmet>
      )).then(() => {
        const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
      }));

      it('sets base tag based on deepest nested component', () => render(h => (
        <div>
          <Helmet>
            <base href="http://mysite.com" />
          </Helmet>
          <Helmet>
            <base href="http://mysite.com/public" />
          </Helmet>
        </div>
      )).then(() => {
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
      }));

      it('does not return render tag when primary attribute is null', () => render(h => (
        <Helmet>
          <base href={undefined} />
        </Helmet>
      )).then(() => {
        const tagNodes = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);
        const existingTags = Array.prototype.slice.call(tagNodes);
        expect(existingTags.length).to.equal(0);
      }));
    });

    describe('meta tags', () => {
      it('updates meta tags', () => render(h => (
        <Helmet>
          <meta charset="utf-8" />
          <meta name="description" content="Test description" />
          <meta http-equiv="content-type" content="text/html" />
          <meta property="og:type" content="article" />
          <meta itemprop="name" content="Test name itemprop" />
        </Helmet>
      )).then(() => {
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
      }));

      it('clears meta tags if none are specified', () => {
        let updated = false;
        return render(h => (
          <Helmet>
            {!updated && <meta name="description" content="Test description" />}
          </Helmet>
        )).then(() => {
          updated = true;
          return rerender();
        }).then(() => {
          const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);
        });
      });

      it("tags without 'name', 'http-equiv', 'property', 'charset', or 'itemprop' are not accepted", () => render(h => (
        <Helmet>
          <meta href="won't work" />
        </Helmet>
      )).then(() => {
        const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
      }));

      it('sets meta tags based on deepest nested component', () => render(h => (
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
      )).then(() => {
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
      }));

      it('allows duplicate meta tags if specified in the same component', () => render(h => (
        <Helmet>
          <meta name="description" content="Test description" />
          <meta
            name="description"
            content="Duplicate description"
          />
        </Helmet>
      )).then(() => {
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
      }));

      it('overrides duplicate meta tags with single meta tag in a nested component', () => render(h => (
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
      )).then(() => {
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
      }));

      it('overrides single meta tag with duplicate meta tags in a nested component', () => render(h => (
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
      )).then(() => {
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
      }));

      it('does not return render tag when primary attribute is null', () => render(h => (
        <Helmet>
          <meta
            name={undefined}
            content="Inner duplicate description"
          />
        </Helmet>
      )).then(() => {
        const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
        const existingTags = Array.prototype.slice.call(tagNodes);
        expect(existingTags.length).to.equal(0);
      }));
    });

    describe('link tags', () => {
      it('updates link tags', () => render(h => (
        <Helmet>
          <link href="http://localhost/helmet" rel="canonical" />
          <link
            href="http://localhost/style.css"
            rel="stylesheet"
            type="text/css"
          />
        </Helmet>
      )).then(() => {
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
      }));

      it('clears link tags if none are specified', () => {
        let updated = false;
        return render(h => (
          <Helmet>
            {!updated && <link href="http://localhost/helmet" rel="canonical" />}
          </Helmet>
        )).then(() => {
          updated = true;
          return rerender();
        }).then(() => {
          const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
          const existingTags = Array.prototype.slice.call(tagNodes);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);
        });
      });

      it("tags without 'href' or 'rel' are not accepted, even if they are valid for other tags", () => render(h => (
        <Helmet>
          <link http-equiv="won't work" />
        </Helmet>
      )).then(() => {
        const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
        const existingTags = Array.prototype.slice.call(tagNodes);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
      }));

      it("tags 'rel' and 'href' properly use 'rel' as the primary identification for this tag, regardless of ordering", () => render(h => (
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
      )).then(() => {
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
      }));

      it("tags with rel='stylesheet' uses the href as the primary identification of the tag, regardless of ordering", () => render(h => (
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
      )).then(() => {
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
      }));

      it('sets link tags based on deepest nested component', () => render(h => (
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
      )).then(() => {
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
      }));

      it('allows duplicate link tags if specified in the same component', () => render(h => (
        <Helmet>
          <link rel="canonical" href="http://localhost/helmet" />
          <link
            rel="canonical"
            href="http://localhost/helmet/component"
          />
        </Helmet>
      )).then(() => {
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
      }));

      it('overrides duplicate link tags with a single link tag in a nested component', () => render(h => (
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
      )).then(() => {
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
      }));

      it('overrides single link tag with duplicate link tags in a nested component', () => render(h => (
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
      )).then(() => {
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
      }));

      it('does not return render tag when primary attribute is null', () => render(h => (
        <Helmet>
          <link rel="icon" sizes="192x192" href={null} />
          <link
            rel="canonical"
            href="http://localhost/helmet/component"
          />
        </Helmet>
      )).then(() => {
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
      }));
    });

    describe('script tags', () => {
      it('updates script tags', () => {
        const scriptInnerHTML = `
          {
            "@context": "http://schema.org",
            "@type": "NewsArticle",
            "url": "http://localhost/helmet"
          }
        `;
        return render(h => (
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
        )).then(() => {
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
        });
      });

      it('clears scripts tags if none are specified', () => {
        let updated = false;
        return render(h => (
          <Helmet>
            {!updated && <script
              src="http://localhost/test.js"
              type="text/javascript"
            />}
          </Helmet>
        )).then(() => {
          updated = true;
          return rerender();
        }).then(() => {
          const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);
        });
      });

      it("tags without 'src' are not accepted", () => render(h => (
        <Helmet>
          <script property="won't work" />
        </Helmet>
      )).then(() => {
        const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
      }));

      it('sets script tags based on deepest nested component', () => render(h => (
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
      )).then(() => {
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
      }));

      it('sets async value correctly', () => render(h => (
        <Helmet>
          <script src="foo.js" async />
        </Helmet>
      )).then(() => {
        const existingTag = headElement.querySelector(`script[${HELMET_ATTRIBUTE}]`);

        expect(existingTag).to.not.equal(undefined);
        expect(existingTag.outerHTML).to.be
          .a('string')
          .that.equals(`<script src="foo.js" async="true" ${HELMET_ATTRIBUTE}="true"></script>`);
      }));

      it('does not return render tag when primary attribute (src) is null', () => render(h => (
        <Helmet>
          <script src={undefined} type="text/javascript" />
        </Helmet>
      )).then(() => {
        const tagNodes = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
        const existingTags = Array.prototype.slice.call(tagNodes);
        expect(existingTags.length).to.equal(0);
      }));

      it('does not return render tag when primary attribute (innerHTML) is null', () => render(h => (
        <Helmet>
          <script innerHTML={undefined} />
        </Helmet>
      )).then(() => {
        const tagNodes = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
        const existingTags = Array.prototype.slice.call(tagNodes);
        expect(existingTags.length).to.equal(0);
      }));
    });

    describe('noscript tags', () => {
      it('updates noscript tags', () => {
        const noscriptInnerHTML = '<link rel="stylesheet" type="text/css" href="foo.css" />';
        return render(h => (
          <Helmet>
            <noscript id="bar">{noscriptInnerHTML}</noscript>
          </Helmet>
        )).then(() => {
          const existingTags = headElement.getElementsByTagName('noscript');

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(1);
          expect(existingTags[0].innerHTML === noscriptInnerHTML &&
                            existingTags[0].id === 'bar');
        });
      });

      it('clears noscripts tags if none are specified', () => {
        let updated = false;
        return render(h => (
          <Helmet>
            {!updated && <noscript id="bar" />}
          </Helmet>
        )).then(() => {
          updated = true;
          return rerender();
        }).then(() => {
          const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);
        });
      });

      it("tags without 'innerHTML' are not accepted", () => render(h => (
        <Helmet>
          <noscript property="won't work" />
        </Helmet>
      )).then(() => {
        const existingTags = headElement.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
      }));

      it('does not return render tag when primary attribute is null', () => render(h => (
        <Helmet>
          <noscript>{undefined}</noscript>
        </Helmet>
      )).then(() => {
        const tagNodes = headElement.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);
        const existingTags = Array.prototype.slice.call(tagNodes);
        expect(existingTags.length).to.equal(0);
      }));
    });

    describe('style tags', () => {
      it('updates style tags', () => {
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

        return render(h => (
          <Helmet>
            <style type="text/css">{cssText1}</style>
            {h('style', { domProps: { innerHTML: cssText2 } })}
          </Helmet>
        )).then(() => {
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
        });
      });

      it('clears style tags if none are specified', () => {
        const cssText = `
          body {
              background-color: green;
          }
        `;
        let updated = false;
        return render(h => (
          <Helmet>
            {!updated && <style type="text/css">{cssText}</style>}
          </Helmet>
        )).then(() => {
          updated = true;
          return rerender();
        }).then(() => {
          const existingTags = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

          expect(existingTags).to.not.equal(undefined);
          expect(existingTags.length).to.equal(0);
        });
      });

      it("tags without 'cssText' are not accepted", () => render(h => (
        <Helmet>
          <style property="won't work" />
        </Helmet>
      )).then(() => {
        const existingTags = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
      }));

      it('does not return render tag when primary attribute is null', () => render(h => (
        <Helmet>
          <style>{undefined}</style>
        </Helmet>
      )).then(() => {
        const tagNodes = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);
        const existingTags = Array.prototype.slice.call(tagNodes);
        expect(existingTags.length).to.equal(0);
      }));
    });
  });

  describe('deferred tags', () => {
    beforeEach(() => {
      window.spy = sinon.spy();
    });

    afterEach(() => {
      delete window.spy;
    });

    it('executes asynchronously', () => {
      const promise = render(h => (
        <div>
          <Helmet>
            <script>
              window.spy(1)
            </script>
          </Helmet>
        </div>
      ));

      expect(window.spy.callCount).to.equal(0);

      return promise.then(() => {
        expect(window.spy.callCount).to.equal(1);
        expect(window.spy.args).to.deep.equal([[1]]);
      });
    });
  });

  describe('misc', () => {
    it('lets you read current state via context.state', () => render(h => (
      <Helmet>
        <title>Fancy title</title>
      </Helmet>
    )).then(() => {
      expect(staticContext.state.title).to.be.equal('Fancy title');
    }));

    it('encodes special characters', () => render(h => (
      <Helmet>
        <meta
          name="description"
          content={'This is "quoted" text and & and \'.'}
        />
      </Helmet>
    )).then(() => {
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
    }));

    xit('does not change the DOM if it recevies identical props', () => {
      const spy = sinon.spy();
      return render(h => (
        <Helmet handleClientStateChange={spy}>
          <meta name="description" content="Test description" />
          <title>Test Title</title>
        </Helmet>
      )).then(() => rerender()).then(() => {
        expect(spy.callCount).to.equal(1);
      });
    });

    xit('does not write the DOM if the client and server are identical', () => {
      headElement.innerHTML = `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript" />`;

      const spy = sinon.spy();
      return render(h => (
        <Helmet handleClientStateChange={spy}>
          <script
            src="http://localhost/test.js"
            type="text/javascript"
          />
        </Helmet>
      )).then(() => {
        expect(spy.called).to.equal(true);

        const [, addedTags, removedTags] = spy.getCall(0).args;

        expect(addedTags.length).to.equal(0);
        expect(removedTags.length).to.equal(0);
      });
    });

    it('only adds new tags and preserves tags when return rendering additional Helmet instances', () => {
      const spy = sinon.spy();
      let addedTags;
      let removedTags;
      return render(h => (
        <Helmet handleClientStateChange={spy}>
          <link
            href="http://localhost/style.css"
            rel="stylesheet"
            type="text/css"
          />
          <meta name="description" content="Test description" />
        </Helmet>
      )).then(() => {
        expect(spy.called).to.equal(true);
        ([, addedTags, removedTags] = spy.getCall(0).args);

        expect(addedTags).to.have.property('metaTags');
        expect(addedTags.metaTags).to.have.deep.property('[0]');
        expect(addedTags.metaTags[0].outerHTML).to.equal(`<meta name="description" content="Test description" ${HELMET_ATTRIBUTE}="true">`);
        expect(addedTags).to.have.property('linkTags');
        expect(addedTags.linkTags).to.have.deep.property('[0]');
        expect(addedTags.linkTags[0].outerHTML).to.equal(`<link href="http://localhost/style.css" rel="stylesheet" type="text/css" ${HELMET_ATTRIBUTE}="true">`);
        expect(Object.keys(removedTags).length).to.equal(0);

        // Re-return rendering will pass new props to an already mounted Helmet
        return render(h => (
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
        )).then(() => {
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
        });
      });
    });

    it('does not accept nested Helmets', () => {
      const warn = sinon.stub(console, 'warn');

      return render(h => (
        <Helmet>
          <title>Test Title</title>
          <Helmet>
            <title>Title you will never see</title>
          </Helmet>
        </Helmet>
      )).then(() => {
        expect(document.title).to.equal('Test Title');
        expect(warn.called).to.equal(true);

        const [warning] = warn.getCall(0).args;
        expect(!!warning).to.equal(true);

        warn.restore();
      });
    });

    it('warns on invalid elements', () => {
      const warn = sinon.stub(console, 'warn');

      return render(h => (
        <Helmet>
          <title>Test Title</title>
          <div>
            <title>Title you will never see</title>
          </div>
        </Helmet>
      )).then(() => {
        expect(document.title).to.equal('Test Title');
        expect(warn.called).to.equal(true);

        const [warning] = warn.getCall(0).args;
        expect(warning).to.equal('Only elements types base, body, html, link, meta, noscript, script, style, title are allowed. Helmet does not support rendering <div> elements. Refer to our API for more information.');

        warn.restore();
      });
    });

    it('warns on invalid self-closing elements', () => {
      const warn = sinon.stub(console, 'warn');

      return render(h => (
        <Helmet>
          <title>Test Title</title>
          <div customAttribute />
        </Helmet>
      )).then(() => {
        expect(document.title).to.equal('Test Title');
        expect(warn.called).to.equal(true);

        const [warning] = warn.getCall(0).args;
        expect(warning).to.equal('Only elements types base, body, html, link, meta, noscript, script, style, title are allowed. Helmet does not support rendering <div> elements. Refer to our API for more information.');

        warn.restore();
      });
    });

    it('throws on invalid strings as children', () => {
      const spy = sinon.spy(() => false);
      return render(
        h => (
          <Helmet>
            <title>Test Title</title>
            <link // eslint-disable-line react/void-dom-elements-no-children
              href="http://localhost/helmet"
              rel="canonical"
            >test
            </link>
          </Helmet>
        ),
        spy,
      ).then(() => {
        assert(spy.calledOnce, 'error handler called');
        const [err] = spy.firstCall.args;
        assert(err instanceof Error, 'Error thrown');
        assert(err.message === '<link /> elements are self-closing and can not contain children. Refer to our API for more information.', 'correct message');
      });
    });

    it('throws on invalid children', () => {
      const spy = sinon.spy(() => false);
      return render(
        h => (
          <Helmet>
            <title>Test Title</title>
            <script>
              <title>Title you will never see</title>
            </script>
          </Helmet>
        ),
        spy,
      ).then(() => {
        assert(spy.calledOnce, 'error handler called');
        const [err] = spy.firstCall.args;
        assert(err instanceof Error, 'Error thrown');
        assert(err.message === 'Helmet expects a string as the default slot of <script>. Did you forget to wrap the slot in braces? ( <script>{``}</script> ) Refer to our API for more information.', err.message);
      });
    });

    it('handles undefined children', () => {
      const charSet = undefined;

      return render(h => (
        <Helmet>
          {charSet && <meta charSet={charSet} />}
          <title>Test Title</title>
        </Helmet>
      )).then(() => {
        expect(document.title).to.equal('Test Title');
      });
    });

    it('recognizes valid tags regardless of attribute ordering', () => render(h => (
      <Helmet>
        <meta content="Test Description" name="description" />
      </Helmet>
    )).then(() => {
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
    }));
  });
});
