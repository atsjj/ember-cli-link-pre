'use strict';

const { createTempDir, emberBuild, readDocument } = require('../test-helper');
const test = require('ava');

test.before(async assert => {
  const output = await createTempDir();

  await emberBuild(output, 'development');

  assert.context.output = output;
  assert.context.document = await readDocument(output);
});

test.after(async assert => {
  await assert.context.output.dispose();
});

test('should not run in development by default', async assert => {
  const { document } = assert.context;

  const preconnectLinks = [...document.querySelectorAll('link[rel="preconnect"]')];
  const preloadLinks = [...document.querySelectorAll('link[rel="preload"]')];

  assert.is(preconnectLinks.length, 0);
  assert.is(preloadLinks.length, 0);
});
