#!/usr/bin/env node

import args from 'args';

import { hexToColor, icons } from '../lib/index.js';

args.option(['f', 'favicon'], 'Path to "favicon.svg"', './favicon.svg');
args.option(['o', 'output'], 'Path to create the "favicon.ico"', './icon-[size].png');
args.option(['s', 'sizes'], 'Sizes used for the ".png" files', '64,128,256,512');
args.option(['b', 'background'], 'Color used for the icon background', '#ffffff');

const options = args.parse(process.argv);

await icons({
  favicon: options.favicon,
  output: options.output,
  iconSizes: options.sizes.split(',').map((e) => parseInt(e)),
  background: hexToColor(options.background),
});