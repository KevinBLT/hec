#!/usr/bin/env node

import { mkdir, writeFile } from 'fs/promises';

import args from 'args';
import path from 'path';

args.option(['r', 'root'],    'Root path for component"', './');
args.option(['w', 'web-dir'], 'Include path for component"', './');

const options  = args.parse(process.argv),
      root     = options.root,
      name     = process.argv.at(-1),
      dir      = path.parse(path.join(root, name, name + '.js')).dir,
      template = `
        import { component, templateByName } from '@hec.js/ui';

        component('${name}', {}, () => {

          return templateByName('${name}');
        });
      `.replaceAll('        ', '');

await mkdir(dir).catch(_ => null);

await writeFile(path.join(dir, name + '.js'),   template);
await writeFile(path.join(dir, name + '.css'),  '');
await writeFile(path.join(dir, name + '.html'), '<link rel="stylesheet" type="text/css" href="' + path.join(options.w, name, name + '.css') + '" >');