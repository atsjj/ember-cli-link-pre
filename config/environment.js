'use strict';

const { name } = require('../package');
const Link = require('../link');
const merge = require('lodash.merge');
const processor = require('../processor');

function intoLink(enabled, array) {
  if (enabled) {
    return array.map(Link.from);
  }

  return array;
}

module.exports = function(environment, appConfig) {
  const { [name]: appConfigOptions = {} } = appConfig || {}

  const defaultOptions = {
    enabled: (environment === 'production'),
    files: ['index.html'],
    preconnect: [],
    preload: [],
    processors: [processor],
  };

  const options = merge(defaultOptions, appConfigOptions);
  const preconnect = intoLink(options.enabled, options.preconnect);
  const preload = intoLink(options.enabled, options.preload);

  return {
    [name]: {
      ...options,
      preconnect,
      preload,
    },
  };
};
