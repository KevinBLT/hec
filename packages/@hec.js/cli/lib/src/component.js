import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import args from 'args';

args.option(['r', 'root'], 'Root path for component"',                 './');
args.option(['w', 'web'],  'Web root path for component"',             '/');
args.option('html',        'Path template to create the `.html` file', '[name].html');
args.option('js',          'Path template to create the `.js` file',   '[name].js');
args.option('css',         'Path template to create the `.css` file',  '[name].css');
args.option('name',        'Template link the html file',              '');

export async function createComponent(type = 'component', options, name = '') {

  if (!name) {
    throw new Error(`Cannot create ${ type } without name`);
  }

  const filePath = (p) => path.join(options.r, p).replaceAll('[name]', name),
        webPath  = (p) => path.join(options.w, p).replaceAll('[name]', name),
        template = `
          import { ${ type }, templateByName } from '@hec.js/ui';

          ${ type }('${ name }', {}, () => {

            return templateByName('${ webPath(options.name || options.html) }');
          });
        `.replaceAll('        ', '');

  await mkdir(path.parse(filePath(options.html)).dir).catch(_ => null);
  await mkdir(path.parse(filePath(options.js)).dir).catch(_ => null);
  await mkdir(path.parse(filePath(options.css)).dir).catch(_ => null);

  return Promise.all([
    writeFile(filePath(options.js),   template),
    writeFile(filePath(options.html), ''),
    writeFile(filePath(options.css),  `[data-${ type }="${ name }"] {\n\n}`)
  ]);
}
