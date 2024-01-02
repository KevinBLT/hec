#!/usr/bin/env node

import args from 'args';

import { favicon } from '../lib/index.js';

args.option(['f', 'favicon'], 'Path to "favicon.svg"', './favicon.svg');
args.option(['o', 'output'], 'Path to create the "favicon.ico"', './favicon.ico');
args.option(['s', 'sizes'], 'Sizes used for the ".ico" file', '16,32,48,64');

const options = args.parse(process.argv);

await favicon({
  favicon: options.favicon,
  output: options.output,
  icoSizes: options.sizes.split(',').map((e) => parseInt(e))
});