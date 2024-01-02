#!/usr/bin/env node

import args from 'args';

import { font } from '../lib/index.js';

args.option(['i', 'input'], 'Path to "./*.svg"', './');
args.option(['n', 'font-name'], 'Name of the font', 'icon');
args.option(['o', 'output'], 'Path to create the "favicon.ico"', './[name].css');

const options = args.parse(process.argv);

await font({
  input: options.input,
  output: options.output.replace('[name]', options.fontName),
  fontName: options.fontName
});