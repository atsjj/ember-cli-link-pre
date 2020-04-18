'use strict';

const { LinkFromError } = require('./errors');
const mime = require('mime-types');

class Link {
  constructor(url, as = null, crossorigin = null, isRemote = null) {
    if (url instanceof URL) {
      this.url = url;
      this.crossorigin = 'anonymous';
      this.isRemote = true;
    } else {
      try {
        this.url = new URL(url);
        this.crossorigin = 'anonymous';
        this.isRemote = true;
      } catch (_) {
        this.url = new URL(url, 'file://');
        this.crossorigin = false;
        this.isRemote = false;
      }
    }

    if (typeof as === 'string') {
      this.as = as;
    } else {
      const type = mime.lookup(url);

      if (type === 'application/javascript') {
        this.as = 'script';
      } else if (type === 'text/css') {
        this.as = 'style';
      } else {
        this.as = null;
      }
    }

    if (typeof crossorigin === 'string') {
      this.crossorigin = crossorigin;
    }

    if (typeof isRemote === 'boolean') {
      this.isRemote = isRemote;
    }
  }

  static from(value) {
    if (value instanceof Link) {
      return value;
    } else if (typeof value === 'string') {
      return new Link(value);
    } else if (typeof value === 'object') {
      const { as = null, crossorigin = null, isRemote = null, url } = value;

      return new Link(url, as, crossorigin, isRemote);
    }

    throw new LinkFromError(value);
  }

  get href() {
    if (this.isRemote) {
      return this.url.toString();
    } else {
      return this.url.pathname;
    }
  }

  get isFile() {
    return this.as !== null;
  }

  get origin() {
    return this.url.origin;
  }
}

module.exports = Link;
