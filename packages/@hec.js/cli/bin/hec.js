#!/usr/bin/env node

import args from 'args';

args.command('favicon',   'Create favicon by providing an svg favicon image');
args.command('icons',     'Create icons (png) by providing an svg image');
args.command('font',      'Creates a css file with a font using icons of the input directory');
args.command('component', 'Creates a hec ui component');
args.command('view',      'Creates a hec ui view');
args.command('page',      'Creates a hec ui page');

args.parse(process.argv);