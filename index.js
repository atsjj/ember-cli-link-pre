'use strict';

const { name } = require('./package');
const BroccoliDomFilter = require('broccoli-dom-filter');
const BroccoliFunnel = require('broccoli-funnel');
const BroccoliMergeTrees = require('broccoli-merge-trees');
const overwrite = true;

module.exports = {
  name,

  postprocessTree(type, tree) {
    if (type === 'all') {
      const {
        [name]: options = {},
      } = this.config(this.parent.env, this.app.project.config(this.parent.env));

      if (options.enabled) {
        const projectName = this.app.project.name();
        const { files, preconnect, preload, processors } = options;
        const processorOptions = { preconnect, preload };

        const broccoliFunnel = new BroccoliFunnel(tree, {
          annotation: `${projectName}:funnel`,
          files,
        });

        const broccoliDomFilter = new BroccoliDomFilter(broccoliFunnel, {
          annotation: `${projectName}:dom-filter`,
          files,
          processorOptions,
          processors,
        });

        const broccoliMergeTrees = new BroccoliMergeTrees([tree, broccoliDomFilter], {
          annotation: `${projectName}:merge-trees`,
          overwrite,
        });

        return broccoliMergeTrees;
      }
    }

    return tree;
  },
};
