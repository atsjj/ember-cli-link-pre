'use strict';

const { JSDOM } = require('jsdom');
const Link = require('../../link');
const merge = require('lodash.merge');
const processor = require('../../processor');
const test = require('ava');

const defaultProcessorOptions = { preconnect: [], preload: [] };

const indexHtml = `
<!doctype html>
<html class="no-js" lang="">
  <head>
    <meta charset="utf-8">
    <title>Hello World</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://some.asset.link/path/to/known.css">
    <link rel="stylesheet" href="css/normalize.css">
    <link rel="stylesheet" href="css/main.css">
  </head>
  <body>
    <!-- Add your site or application content here -->
    <p>Hello world! This is HTML5 Boilerplate.</p>
    <script src="https://another.asset.link/path/to/known.js"></script>
  </body>
</html>
`;

function readDocument(assert, processorOptions = {}) {
  return processor(assert.context.jsdom, merge(defaultProcessorOptions, processorOptions))
    .window.document;
}

test.beforeEach(assert => {
  assert.context.jsdom = new JSDOM(indexHtml);
});

test('should have preconnect and preload link tags for existing tags', assert => {
  const document = readDocument(assert);
  const preconnectLinks = [...document.querySelectorAll('link[rel="preconnect"]')];
  const preloadLinks = [...document.querySelectorAll('link[rel="preload"]')];

  assert.is(preconnectLinks.length, 2);
  assert.is(preloadLinks.length, 4);
});

test('should preconnect existing scripts and styles', assert => {
  const document = readDocument(assert);

  const [
    linkA,
    linkB,
  ] = [...document.querySelectorAll('link[rel="preconnect"]')];

  assert.is(linkA.getAttribute('crossorigin'), 'anonymous');
  assert.is(linkA.getAttribute('href'), 'https://another.asset.link');
  assert.is(linkA.getAttribute('rel'), 'preconnect');

  assert.is(linkB.getAttribute('crossorigin'), 'anonymous');
  assert.is(linkB.getAttribute('rel'), 'preconnect');
  assert.is(linkB.getAttribute('href'), 'https://some.asset.link');
});

test('should preload existing scripts and styles', assert => {
  const document = readDocument(assert);

  const [
    linkA,
    linkB,
    linkC,
    linkD,
  ] = [...document.querySelectorAll('link[rel="preload"]')];

  assert.is(linkA.getAttribute('as'), 'script');
  assert.is(linkA.getAttribute('crossorigin'), 'anonymous');
  assert.is(linkA.getAttribute('href'), 'https://another.asset.link/path/to/known.js');
  assert.is(linkA.getAttribute('rel'), 'preload');

  assert.is(linkB.getAttribute('as'), 'style');
  assert.is(linkB.getAttribute('crossorigin'), 'anonymous');
  assert.is(linkB.getAttribute('rel'), 'preload');
  assert.is(linkB.getAttribute('href'), 'https://some.asset.link/path/to/known.css');

  assert.is(linkC.getAttribute('as'), 'style');
  assert.is(linkC.getAttribute('crossorigin'), null);
  assert.is(linkC.getAttribute('href'), '/css/normalize.css');
  assert.is(linkC.getAttribute('rel'), 'preload');

  assert.is(linkD.getAttribute('as'), 'style');
  assert.is(linkD.getAttribute('crossorigin'), null);
  assert.is(linkD.getAttribute('href'), '/css/main.css');
  assert.is(linkD.getAttribute('rel'), 'preload');
});

test('should not mutate existing scripts and styles', assert => {
  const document = readDocument(assert);
  const stylesheets = [...document.querySelectorAll('link[rel="stylesheet"]')];
  const scripts = [...document.querySelectorAll('script[src]')];
  const [ linkA, linkB, linkC ] = stylesheets;
  const [ scriptA ] = scripts;

  assert.is(stylesheets.length, 3);
  assert.is(scripts.length, 1);
  assert.is(linkA.getAttribute('href'), 'https://some.asset.link/path/to/known.css');
  assert.is(linkB.getAttribute('href'), 'css/normalize.css');
  assert.is(linkC.getAttribute('href'), 'css/main.css');
  assert.is(scriptA.getAttribute('src'), 'https://another.asset.link/path/to/known.js');
});

test('should inject configured option.preconnect using strings', assert => {
  const linkA = 'https://link.a.tld/a/p/t/u';
  const linkB = 'https://link.b.tld/b/p/t/u';
  const linkC = 'https://link.c.tld/c/p/t/u';
  const linkD = 'https://link.d.tld/d/p/t/u';
  const document = readDocument(assert, { preconnect: [linkA, linkB, linkC, linkD] });
  const tags = [...document.querySelectorAll('link[rel="preconnect"]')];
  const [ tagA, tagB, tagC, tagD, tagE, tagF ] = tags;

  assert.is(tags.length, 6);

  assert.is(tagA.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagA.getAttribute('href'), 'https://link.a.tld');
  assert.is(tagA.getAttribute('rel'), 'preconnect');

  assert.is(tagB.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagB.getAttribute('href'), 'https://link.b.tld');
  assert.is(tagB.getAttribute('rel'), 'preconnect');

  assert.is(tagC.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagC.getAttribute('href'), 'https://link.c.tld');
  assert.is(tagC.getAttribute('rel'), 'preconnect');

  assert.is(tagD.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagD.getAttribute('href'), 'https://link.d.tld');
  assert.is(tagD.getAttribute('rel'), 'preconnect');

  assert.is(tagE.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagE.getAttribute('href'), 'https://another.asset.link');
  assert.is(tagE.getAttribute('rel'), 'preconnect');

  assert.is(tagF.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagF.getAttribute('rel'), 'preconnect');
  assert.is(tagF.getAttribute('href'), 'https://some.asset.link');
});

test('should inject configured option.preconnect using objects', assert => {
  const linkA = Link.from({ url: 'https://link.a.tld/a/p/t/u', crossorigin: 'anonymous' });
  const linkB = Link.from({ url: 'https://link.b.tld/b/p/t/u', crossorigin: 'use-credentials' });
  const linkC = Link.from({ url: 'https://link.c.tld/c/p/t/u', crossorigin: 'anonymous' });
  const linkD = Link.from({ url: 'https://link.d.tld/d/p/t/u', crossorigin: 'use-credentials' });
  const document = readDocument(assert, { preconnect: [linkA, linkB, linkC, linkD] });
  const tags = [...document.querySelectorAll('link[rel="preconnect"]')];
  const [ tagA, tagB, tagC, tagD, tagE, tagF ] = tags;

  assert.is(tags.length, 6);

  assert.is(tagA.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagA.getAttribute('href'), 'https://link.a.tld');
  assert.is(tagA.getAttribute('rel'), 'preconnect');

  assert.is(tagB.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagB.getAttribute('href'), 'https://link.b.tld');
  assert.is(tagB.getAttribute('rel'), 'preconnect');

  assert.is(tagC.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagC.getAttribute('href'), 'https://link.c.tld');
  assert.is(tagC.getAttribute('rel'), 'preconnect');

  assert.is(tagD.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagD.getAttribute('href'), 'https://link.d.tld');
  assert.is(tagD.getAttribute('rel'), 'preconnect');

  assert.is(tagE.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagE.getAttribute('href'), 'https://another.asset.link');
  assert.is(tagE.getAttribute('rel'), 'preconnect');

  assert.is(tagF.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagF.getAttribute('rel'), 'preconnect');
  assert.is(tagF.getAttribute('href'), 'https://some.asset.link');
});

test('should inject configured option.preconnect using Link instances', assert => {
  const linkA = new Link('https://link.a.tld/a/p/t/u', null, 'anonymous');
  const linkB = new Link('https://link.b.tld/b/p/t/u', null, 'use-credentials');
  const linkC = new Link('https://link.c.tld/c/p/t/u', null, 'anonymous');
  const linkD = new Link('https://link.d.tld/d/p/t/u', null, 'use-credentials');
  const document = readDocument(assert, { preconnect: [linkA, linkB, linkC, linkD] });
  const tags = [...document.querySelectorAll('link[rel="preconnect"]')];
  const [ tagA, tagB, tagC, tagD, tagE, tagF ] = tags;

  assert.is(tags.length, 6);

  assert.is(tagA.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagA.getAttribute('href'), 'https://link.a.tld');
  assert.is(tagA.getAttribute('rel'), 'preconnect');

  assert.is(tagB.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagB.getAttribute('href'), 'https://link.b.tld');
  assert.is(tagB.getAttribute('rel'), 'preconnect');

  assert.is(tagC.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagC.getAttribute('href'), 'https://link.c.tld');
  assert.is(tagC.getAttribute('rel'), 'preconnect');

  assert.is(tagD.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagD.getAttribute('href'), 'https://link.d.tld');
  assert.is(tagD.getAttribute('rel'), 'preconnect');

  assert.is(tagE.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagE.getAttribute('href'), 'https://another.asset.link');
  assert.is(tagE.getAttribute('rel'), 'preconnect');

  assert.is(tagF.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagF.getAttribute('rel'), 'preconnect');
  assert.is(tagF.getAttribute('href'), 'https://some.asset.link');
});

test('should inject configured option.preload using strings', assert => {
  const linkA = 'https://link.a.tld/a/p/t/ua.js';
  const linkB = 'https://link.b.tld/b/p/t/ub.css';
  const linkC = 'https://link.c.tld/c/p/t/uc.js';
  const linkD = 'https://link.d.tld/d/p/t/ud.css';
  const document = readDocument(assert, { preload: [linkA, linkB, linkC, linkD] });
  const tags = [...document.querySelectorAll('link[rel="preload"]')];
  const [ tagA, tagB, tagC, tagD, tagE, tagF, tagG, tagH ] = tags;

  assert.is(tags.length, 8);

  assert.is(tagA.getAttribute('as'), 'script');
  assert.is(tagA.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagA.getAttribute('href'), linkA);
  assert.is(tagA.getAttribute('rel'), 'preload');

  assert.is(tagB.getAttribute('as'), 'style');
  assert.is(tagB.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagB.getAttribute('href'), linkB);
  assert.is(tagB.getAttribute('rel'), 'preload');

  assert.is(tagC.getAttribute('as'), 'script');
  assert.is(tagC.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagC.getAttribute('href'), linkC);
  assert.is(tagC.getAttribute('rel'), 'preload');

  assert.is(tagD.getAttribute('as'), 'style');
  assert.is(tagD.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagD.getAttribute('href'), linkD);
  assert.is(tagD.getAttribute('rel'), 'preload');

  assert.is(tagE.getAttribute('as'), 'script');
  assert.is(tagE.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagE.getAttribute('href'), 'https://another.asset.link/path/to/known.js');
  assert.is(tagE.getAttribute('rel'), 'preload');

  assert.is(tagF.getAttribute('as'), 'style');
  assert.is(tagF.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagF.getAttribute('rel'), 'preload');
  assert.is(tagF.getAttribute('href'), 'https://some.asset.link/path/to/known.css');

  assert.is(tagG.getAttribute('as'), 'style');
  assert.is(tagG.getAttribute('crossorigin'), null);
  assert.is(tagG.getAttribute('href'), '/css/normalize.css');
  assert.is(tagG.getAttribute('rel'), 'preload');

  assert.is(tagH.getAttribute('as'), 'style');
  assert.is(tagH.getAttribute('crossorigin'), null);
  assert.is(tagH.getAttribute('href'), '/css/main.css');
  assert.is(tagH.getAttribute('rel'), 'preload');
});

test('should inject configured option.preload using objects', assert => {
  const linkA = Link.from({ url: 'https://l.a.t/a/p/t/ua.js', crossorigin: 'anonymous' });
  const linkB = Link.from({ url: 'https://l.b.t/b/p/t/ub.css', crossorigin: 'use-credentials' });
  const linkC = Link.from({ url: 'https://l.c.t/c/p/t/uc.js', crossorigin: 'anonymous' });
  const linkD = Link.from({ url: 'https://l.d.t/d/p/t/ud.css', crossorigin: 'use-credentials' });
  const document = readDocument(assert, { preload: [linkA, linkB, linkC, linkD] });
  const tags = [...document.querySelectorAll('link[rel="preload"]')];
  const [ tagA, tagB, tagC, tagD, tagE, tagF, tagG, tagH ] = tags;

  assert.is(tags.length, 8);

  assert.is(tagA.getAttribute('as'), 'script');
  assert.is(tagA.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagA.getAttribute('href'), 'https://l.a.t/a/p/t/ua.js');
  assert.is(tagA.getAttribute('rel'), 'preload');

  assert.is(tagB.getAttribute('as'), 'style');
  assert.is(tagB.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagB.getAttribute('href'), 'https://l.b.t/b/p/t/ub.css');
  assert.is(tagB.getAttribute('rel'), 'preload');

  assert.is(tagC.getAttribute('as'), 'script');
  assert.is(tagC.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagC.getAttribute('href'), 'https://l.c.t/c/p/t/uc.js');
  assert.is(tagC.getAttribute('rel'), 'preload');

  assert.is(tagD.getAttribute('as'), 'style');
  assert.is(tagD.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagD.getAttribute('href'), 'https://l.d.t/d/p/t/ud.css');
  assert.is(tagD.getAttribute('rel'), 'preload');

  assert.is(tagE.getAttribute('as'), 'script');
  assert.is(tagE.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagE.getAttribute('href'), 'https://another.asset.link/path/to/known.js');
  assert.is(tagE.getAttribute('rel'), 'preload');

  assert.is(tagF.getAttribute('as'), 'style');
  assert.is(tagF.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagF.getAttribute('rel'), 'preload');
  assert.is(tagF.getAttribute('href'), 'https://some.asset.link/path/to/known.css');

  assert.is(tagG.getAttribute('as'), 'style');
  assert.is(tagG.getAttribute('crossorigin'), null);
  assert.is(tagG.getAttribute('href'), '/css/normalize.css');
  assert.is(tagG.getAttribute('rel'), 'preload');

  assert.is(tagH.getAttribute('as'), 'style');
  assert.is(tagH.getAttribute('crossorigin'), null);
  assert.is(tagH.getAttribute('href'), '/css/main.css');
  assert.is(tagH.getAttribute('rel'), 'preload');
});

test('should inject configured option.preload using Link instances', assert => {
  const linkA = new Link('https://link.a.tld/a/p/t/ua.js', null, 'anonymous');
  const linkB = new Link('https://link.b.tld/b/p/t/ub.css', null, 'use-credentials');
  const linkC = new Link('https://link.c.tld/c/p/t/uc.js', null, 'anonymous');
  const linkD = new Link('https://link.d.tld/d/p/t/ud.css', null, 'use-credentials');
  const document = readDocument(assert, { preload: [linkA, linkB, linkC, linkD] });
  const tags = [...document.querySelectorAll('link[rel="preload"]')];
  const [ tagA, tagB, tagC, tagD, tagE, tagF, tagG, tagH ] = tags;

  assert.is(tags.length, 8);

  assert.is(tagA.getAttribute('as'), 'script');
  assert.is(tagA.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagA.getAttribute('href'), 'https://link.a.tld/a/p/t/ua.js');
  assert.is(tagA.getAttribute('rel'), 'preload');

  assert.is(tagB.getAttribute('as'), 'style');
  assert.is(tagB.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagB.getAttribute('href'), 'https://link.b.tld/b/p/t/ub.css');
  assert.is(tagB.getAttribute('rel'), 'preload');

  assert.is(tagC.getAttribute('as'), 'script');
  assert.is(tagC.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagC.getAttribute('href'), 'https://link.c.tld/c/p/t/uc.js');
  assert.is(tagC.getAttribute('rel'), 'preload');

  assert.is(tagD.getAttribute('as'), 'style');
  assert.is(tagD.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagD.getAttribute('href'), 'https://link.d.tld/d/p/t/ud.css');
  assert.is(tagD.getAttribute('rel'), 'preload');

  assert.is(tagE.getAttribute('as'), 'script');
  assert.is(tagE.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagE.getAttribute('href'), 'https://another.asset.link/path/to/known.js');
  assert.is(tagE.getAttribute('rel'), 'preload');

  assert.is(tagF.getAttribute('as'), 'style');
  assert.is(tagF.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagF.getAttribute('rel'), 'preload');
  assert.is(tagF.getAttribute('href'), 'https://some.asset.link/path/to/known.css');

  assert.is(tagG.getAttribute('as'), 'style');
  assert.is(tagG.getAttribute('crossorigin'), null);
  assert.is(tagG.getAttribute('href'), '/css/normalize.css');
  assert.is(tagG.getAttribute('rel'), 'preload');

  assert.is(tagH.getAttribute('as'), 'style');
  assert.is(tagH.getAttribute('crossorigin'), null);
  assert.is(tagH.getAttribute('href'), '/css/main.css');
  assert.is(tagH.getAttribute('rel'), 'preload');
});

test('should dedupe option.connect and option.preload', assert => {
  const linkA = new Link('https://link.a.tld/a/p/t/ua.js', null, 'anonymous');
  const linkB = new Link('https://link.b.tld/b/p/t/ub.css', null, 'use-credentials');
  const linkC = new Link('https://link.a.tld/a/p/t/ua.js', null, 'anonymous');
  const linkD = new Link('https://link.b.tld/b/p/t/ub.css', null, 'use-credentials');
  const document = readDocument(assert, { preconnect: [linkA, linkB], preload: [linkC, linkD] });
  const tags = [...document.querySelectorAll('link[rel="preload"]')];
  const [ tagA, tagB, tagC, tagD, tagE, tagF, tagG, tagH ] = tags;

  assert.is(tags.length, 8);

  assert.is(tagA.getAttribute('as'), 'script');
  assert.is(tagA.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagA.getAttribute('href'), 'https://link.a.tld/a/p/t/ua.js');
  assert.is(tagA.getAttribute('rel'), 'preload');

  assert.is(tagB.getAttribute('as'), 'style');
  assert.is(tagB.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagB.getAttribute('href'), 'https://link.b.tld/b/p/t/ub.css');
  assert.is(tagB.getAttribute('rel'), 'preload');

  assert.is(tagC.getAttribute('as'), 'script');
  assert.is(tagC.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagC.getAttribute('href'), 'https://link.c.tld/c/p/t/uc.js');
  assert.is(tagC.getAttribute('rel'), 'preload');

  assert.is(tagD.getAttribute('as'), 'style');
  assert.is(tagD.getAttribute('crossorigin'), 'use-credentials');
  assert.is(tagD.getAttribute('href'), 'https://link.d.tld/d/p/t/ud.css');
  assert.is(tagD.getAttribute('rel'), 'preload');

  assert.is(tagE.getAttribute('as'), 'script');
  assert.is(tagE.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagE.getAttribute('href'), 'https://another.asset.link/path/to/known.js');
  assert.is(tagE.getAttribute('rel'), 'preload');

  assert.is(tagF.getAttribute('as'), 'style');
  assert.is(tagF.getAttribute('crossorigin'), 'anonymous');
  assert.is(tagF.getAttribute('rel'), 'preload');
  assert.is(tagF.getAttribute('href'), 'https://some.asset.link/path/to/known.css');

  assert.is(tagG.getAttribute('as'), 'style');
  assert.is(tagG.getAttribute('crossorigin'), null);
  assert.is(tagG.getAttribute('href'), '/css/normalize.css');
  assert.is(tagG.getAttribute('rel'), 'preload');

  assert.is(tagH.getAttribute('as'), 'style');
  assert.is(tagH.getAttribute('crossorigin'), null);
  assert.is(tagH.getAttribute('href'), '/css/main.css');
  assert.is(tagH.getAttribute('rel'), 'preload');
});
