# Ember CLI Link Pre

[![Latest npm release][npm-badge]][npm-badge-url]
[![TravisCI Build Status][travis-badge]][travis-badge-url]

[npm-badge]: https://img.shields.io/npm/v/ember-cli-link-pre.svg
[npm-badge-url]: https://www.npmjs.com/package/ember-cli-link-pre
[travis-badge]: https://img.shields.io/travis/com/atsjj/ember-cli-link-pre/master.svg?label=TravisCI
[travis-badge-url]: https://travis-ci.com/atsjj/ember-cli-link-pre
[github-actions-badge]: https://github.com/atsjj/ember-cli-link-pre/workflows/CI/badge.svg
[github-actions-ci-url]: https://github.com/atsjj/ember-cli-link-pre/actions?query=workflow%3ACI
[license-url]: LICENSE
[broccoli-asset-rev-url]: https://github.com/rickharrison/broccoli-asset-rev
[broccoli-dom-filter-url]: https://github.com/atsjj/broccoli-dom-filter
[jsdom-url]: https://github.com/jsdom/jsdom

`ember-cli-link-pre` scans your `index.html` and looks for `<link rel="stylesheet">` and
`<script src="...">` tags then creates `preconnect` and `preload` links for those assets without
needing to be configured. Even better, this only happens when you ship to production! Plays nicely
with [broccoli-asset-rev][broccoli-asset-rev-url].

This addon uses [broccoli-dom-filter][broccoli-dom-filter-url] behind the scenes and exposes an
instance of [jsdom][jsdom-url].

## Installation

```
ember install ember-cli-link-pre
```

## Configuration

It is possible to configure `ember-cli-link-pre` to manually inject `link` tags for either
`preconnect` or `preload`. If you have templates that use external assets that aren't part of your
Ember toolchain, you can configure this addon to inject the `link` tags you need.

Inside of your app's `config/environment.js`:

```javascript
'use strict';

module.exports = function(environment) {
  let ENV = {
    ['ember-cli-link-pre']: {
      enabled: (environment === 'production'),
      preconnect: [
        'https://some.preconnect.link',
      ],
      preload: [
        'https://another.preload.link/neat-stylesheet.css',
        'https://some.preload.link/fantastic-script.js',
      ],
    },
  };

  return ENV;
};
```

## Documentation

### `config/environment.js ['ember-cli-link-pre'] object`

* `enabled`: (`boolean`) Enabled by default in production.
* `preconnect`: (`string[] || { url: string,
  as?: ('script' || 'style'), crossdomain?: ('anonymous' || 'use-credentials') }`) An array of URLs.
  Can be objects if you need to customize crossdomain behavior or if the `as` attribute cannot be
  determined from the URL.
* `preload`: (`string[] || { url: string,
  as?: ('script' || 'style'), crossdomain?: ('anonymous' || 'use-credentials') }`) An array of URLs.
  Can be objects if you need to customize crossdomain behavior or if the `as` attribute cannot be
  determined from the URL.
* `files`: (`string[] || RegExp[] || Array<function(path: string):boolean>`) An array of files that
  to be scanned by the addon for modification. Defaults to `index.html`.
* `processors`: (`Array<function(jsdom: JSDOM, { preconnect: Link[], preload: Link[] }):JSDOM>`) An
  array of processors that modify any matched `files`. Will always contain the built-in processor
  and will append any `processor` callbacks that are configured.

## Tests

```
npm install
npm test
```

## License

This project is licensed under the [MIT License][license-url].
