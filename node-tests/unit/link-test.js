'use strict';

const { LinkFromError } = require('../../errors');
const Link = require('../../link');
const test = require('ava');

test('link should construct from arguments', assert => {
  const url = 'https://some.preconnect.link/path/to/unknown';
  const linkA = new Link(url);
  const linkB = new Link(url, 'script');
  const linkC = new Link(url, 'style', 'anonymous');
  const linkD = new Link(url, 'script', 'use-credentials', false);

  assert.is(linkA.as, null);
  assert.is(linkA.crossorigin, 'anonymous');
  assert.is(linkA.href, 'https://some.preconnect.link/path/to/unknown');
  assert.false(linkA.isFile);
  assert.is(linkA.origin, 'https://some.preconnect.link');
  assert.true(linkA.isRemote);

  assert.is(linkB.as, 'script');
  assert.is(linkB.crossorigin, 'anonymous');
  assert.is(linkB.href, 'https://some.preconnect.link/path/to/unknown');
  assert.true(linkB.isFile);
  assert.is(linkB.origin, 'https://some.preconnect.link');
  assert.true(linkB.isRemote);

  assert.is(linkC.as, 'style');
  assert.is(linkC.crossorigin, 'anonymous');
  assert.is(linkC.href, 'https://some.preconnect.link/path/to/unknown');
  assert.true(linkC.isFile);
  assert.is(linkC.origin, 'https://some.preconnect.link');
  assert.true(linkC.isRemote);

  assert.is(linkD.as, 'script');
  assert.is(linkD.crossorigin, 'use-credentials');
  assert.is(linkD.href, '/path/to/unknown');
  assert.true(linkD.isFile);
  assert.is(linkD.origin, 'https://some.preconnect.link');
  assert.false(linkD.isRemote);
});

test('link should parse instances of Link', assert => {
  const linkA = Link.from('https://some.preconnect.link/path/to/unknown');
  const linkB = Link.from(linkA);
  const linkC = Link.from('https://some.preconnect.link/path/to/known.css');
  const linkD = Link.from(linkC);
  const linkE = Link.from('https://some.preconnect.link/path/to/known.js');
  const linkF = Link.from(linkE);

  assert.deepEqual(linkB, linkA);
  assert.deepEqual(linkD, linkC);
  assert.deepEqual(linkF, linkE);
});

test('link should parse url string without an extension', assert => {
  const link = Link.from('https://some.preconnect.link/path/to/unknown');

  assert.is(link.as, null);
  assert.is(link.crossorigin, 'anonymous');
  assert.is(link.href, 'https://some.preconnect.link/path/to/unknown');
  assert.false(link.isFile);
  assert.is(link.origin, 'https://some.preconnect.link');
  assert.true(link.isRemote);
});

test('link should parse url string with a css extension', assert => {
  const link = Link.from('https://some.preconnect.link/path/to/known.css');

  assert.is(link.as, 'style');
  assert.is(link.crossorigin, 'anonymous');
  assert.is(link.href, 'https://some.preconnect.link/path/to/known.css');
  assert.true(link.isFile);
  assert.is(link.origin, 'https://some.preconnect.link');
  assert.true(link.isRemote);
});

test('link should parse url string with a js extension', assert => {
  const link = Link.from('https://some.preconnect.link/path/to/known.js');

  assert.is(link.as, 'script');
  assert.is(link.crossorigin, 'anonymous');
  assert.is(link.href, 'https://some.preconnect.link/path/to/known.js');
  assert.true(link.isFile);
  assert.is(link.origin, 'https://some.preconnect.link');
  assert.true(link.isRemote);
});

test('link should parse url options', assert => {
  const url = 'https://some.preconnect.link/path/to/unknown';
  const linkA = Link.from({ url });
  const linkB = Link.from({ url, as: 'script' });
  const linkC = Link.from({ url, as: 'style', crossorigin: 'anonymous' });
  const linkD = Link.from({ url, as: 'script', crossorigin: 'use-credentials', isRemote: false });

  assert.is(linkA.as, null);
  assert.is(linkA.crossorigin, 'anonymous');
  assert.is(linkA.href, 'https://some.preconnect.link/path/to/unknown');
  assert.false(linkA.isFile);
  assert.is(linkA.origin, 'https://some.preconnect.link');
  assert.true(linkA.isRemote);

  assert.is(linkB.as, 'script');
  assert.is(linkB.crossorigin, 'anonymous');
  assert.is(linkB.href, 'https://some.preconnect.link/path/to/unknown');
  assert.true(linkB.isFile);
  assert.is(linkB.origin, 'https://some.preconnect.link');
  assert.true(linkB.isRemote);

  assert.is(linkC.as, 'style');
  assert.is(linkC.crossorigin, 'anonymous');
  assert.is(linkC.href, 'https://some.preconnect.link/path/to/unknown');
  assert.true(linkC.isFile);
  assert.is(linkC.origin, 'https://some.preconnect.link');
  assert.true(linkC.isRemote);

  assert.is(linkD.as, 'script');
  assert.is(linkD.crossorigin, 'use-credentials');
  assert.is(linkD.href, '/path/to/unknown');
  assert.true(linkD.isFile);
  assert.is(linkD.origin, 'https://some.preconnect.link');
  assert.false(linkD.isRemote);
});

test('link should throw on bad types', assert => {
  const expectedThrow = { instanceOf: LinkFromError };

  assert.throws(() => Link.from(false), expectedThrow);
  assert.throws(() => Link.from(1), expectedThrow);
  assert.throws(() => Link.from(function() {}), expectedThrow);
});
