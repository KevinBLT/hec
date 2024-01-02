import svgtofont from 'svgtofont';
import path      from 'path';

import { 
  readFile, 
  mkdir, 
  stat, 
  writeFile 
} from 'fs/promises';
import { tmpdir } from 'os';

export async function font({input = './', fontName = 'icon', output = './icon.css'}) {

  if (await stat(input)) {
    const dir = path.join(tmpdir(), 'font');

    await mkdir(path.join(path.parse(output).dir)).catch(_ => null);

    await svgtofont({
      log      : false,
      src      : input,
      dist     : dir,
      fontName : fontName,
      css      : true
    });
  
    let css   = await readFile(path.join(dir, `${fontName}.css`), {encoding: 'utf-8'}),
        woff2 = await readFile(path.join(dir, `${fontName}.woff2`));
        
    css = css.replaceAll(/\[[^{]+/gm, `.${fontName} `);
    css = css.replaceAll(`.${fontName}-`, `.${fontName}.`);
    css = css.replaceAll('16px',   ' 1rem;\n  line-height: 1');
    css = css.replaceAll(/@font-face {[^}]+}/g, '');
    css = css.replaceAll('font-style:normal;', 'font-style: normal;');

    css =  `
      @font-face {
        font-family: '${fontName}';
        font-display: block;
        src: url('data:font/woff2;base64,${woff2.toString('base64')}') format('woff2');
      }
    `.replaceAll('      ', '').trim() + css;
  
    await writeFile(output, css.replaceAll('"', '\'').replaceAll(/\n{2,}/g, '\n\n').trim());
  }
}