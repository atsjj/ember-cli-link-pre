'use strict';

const { createTempDir, emberBuild, readDocument } = require('../test-helper');
const test = require('ava');

test.before(async assert => {
  const output = await createTempDir();

  await emberBuild(output, 'production');

  assert.context.output = output;
  assert.context.document = await readDocument(output);
});

test.after(async assert => {
  await assert.context.output.dispose();
});

test('should run in production by default', assert => {
  const { document } = assert.context;

  const preconnectLinks = [...document.querySelectorAll('link[rel="preconnect"]')];
  const preloadLinks = [...document.querySelectorAll('link[rel="preload"]')];

  assert.is(preconnectLinks.length, 3);
  assert.is(preloadLinks.length, 6);
});

test('should have link[rel="preconnect"] tags', assert => {
  const { document } = assert.context;
  const [
    somePreconnectLink,
    anotherPreloadLink,
    somePreloadLink,
  ] = [...document.querySelectorAll('link[rel="preconnect"]')];

  assert.is(somePreconnectLink.getAttribute('crossorigin'), 'anonymous');
  assert.is(somePreconnectLink.getAttribute('href'), 'https://some.preconnect.link');
  assert.is(somePreconnectLink.getAttribute('rel'), 'preconnect');

  assert.is(anotherPreloadLink.getAttribute('crossorigin'), 'anonymous');
  assert.is(anotherPreloadLink.getAttribute('rel'), 'preconnect');
  assert.is(anotherPreloadLink.getAttribute('href'), 'https://another.preload.link');

  assert.is(somePreloadLink.getAttribute('crossorigin'), 'anonymous');
  assert.is(somePreloadLink.getAttribute('href'), 'https://some.preload.link');
  assert.is(somePreloadLink.getAttribute('rel'), 'preconnect');
});

test('should have link[rel="preload"] tags', assert => {
  const { document } = assert.context;
  const [
    anotherPreloadLink,
    somePreloadLink,
    vendorScript,
    dummyScript,
    vendorStyle,
    dummyStyle,
  ] = [...document.querySelectorAll('link[rel="preload"]')];

  assert.is(anotherPreloadLink.getAttribute('as'), 'style');
  assert.is(anotherPreloadLink.getAttribute('crossorigin'), 'anonymous');
  assert.is(anotherPreloadLink.getAttribute('rel'), 'preload');
  assert.is(anotherPreloadLink.getAttribute('href'),
    'https://another.preload.link/neat-stylesheet.css');

  assert.is(somePreloadLink.getAttribute('as'), 'script');
  assert.is(somePreloadLink.getAttribute('crossorigin'), 'anonymous');
  assert.is(somePreloadLink.getAttribute('rel'), 'preload');
  assert.is(somePreloadLink.getAttribute('href'),
    'https://some.preload.link/fantastic-script.js');

  assert.is(vendorScript.getAttribute('as'), 'script');
  assert.is(vendorScript.getAttribute('crossorigin'), null);
  assert.is(vendorScript.getAttribute('rel'), 'preload');
  assert.is(vendorScript.getAttribute('href'),
    '/assets/vendor-3691d1aca8d4635fb57298d375f2d857.js');

  assert.is(dummyScript.getAttribute('as'), 'script');
  assert.is(dummyScript.getAttribute('crossorigin'), null);
  assert.is(dummyScript.getAttribute('rel'), 'preload');
  assert.is(dummyScript.getAttribute('href'),
    '/assets/dummy-c913803d802296b601a241b92182e58b.js');

  assert.is(vendorStyle.getAttribute('as'), 'style');
  assert.is(vendorStyle.getAttribute('crossorigin'), null);
  assert.is(vendorStyle.getAttribute('rel'), 'preload');
  assert.is(vendorStyle.getAttribute('href'),
    '/assets/vendor-d41d8cd98f00b204e9800998ecf8427e.css');

  assert.is(dummyStyle.getAttribute('as'), 'style');
  assert.is(dummyStyle.getAttribute('crossorigin'), null);
  assert.is(dummyStyle.getAttribute('rel'), 'preload');
  assert.is(dummyStyle.getAttribute('href'),
    '/assets/dummy-d41d8cd98f00b204e9800998ecf8427e.css');
});
