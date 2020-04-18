'use strict';

const Link = require('./link');
const unionBy = require('lodash.unionby');

function processor(dom, { preconnect, preload }) {
  const document = dom.window.document;

  const head = document.querySelector('head');
  const insertAt = head.querySelector('link');

  const preconnects = preconnect.map(value => Link.from(value));
  const preloads = preload.map(value => Link.from(value));

  const scripts = [...document.body.querySelectorAll('script[src]')]
    .map(({ src }) => new Link(src, 'script'));

  const links = [...head.querySelectorAll('link[rel="stylesheet"]')]
    .map(({ href }) => new Link(href, 'style'));

  const preconnectLinks = unionBy(preconnects, preloads, scripts, links, 'origin')
    .filter(link => link.isRemote)
    .map(link => {
      const tag = document.createElement('link');

      tag.rel = 'preconnect';

      if (link.crossorigin) {
        tag.setAttribute('crossorigin', link.crossorigin);
      }

      tag.href = link.origin;

      return tag;
    });

  const preloadLinks = unionBy(preconnects, preloads, scripts, links, 'href')
    .filter(link => link.isFile)
    .map(link => {
      const tag = document.createElement('link');

      tag.rel = 'preload';
      tag.setAttribute('as', link.as);

      if (link.isRemote && link.crossorigin) {
        tag.setAttribute('crossorigin', link.crossorigin);
      }

      tag.href = link.href;

      return tag;
    });

  preconnectLinks.forEach(link => head.insertBefore(link, insertAt));
  preloadLinks.forEach(link => head.insertBefore(link, insertAt));

  return dom;
}

module.exports = processor;
