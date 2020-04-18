'use strict';

const { createTempDir } = require('broccoli-test-helper');
const { join } = require('path');
const { JSDOM } = require('jsdom');
const { readFile } = require('fs');
const execa = require('execa');

function readFileCompat(path) {
  return new Promise((resolve, reject) => {
    readFile(path, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    })
  });
}

async function emberBuild(tree, environment) {
  await execa.node('./node_modules/.bin/ember', ['build', '--environment', environment,
    '--output-path', tree.path()]);
}

async function readDocument(tree, file = 'index.html') {
  return new JSDOM(await readFileCompat(join(tree.path(), file))).window.document;
}

module.exports = {
  createTempDir,
  emberBuild,
  readDocument,
};
