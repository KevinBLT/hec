import { readFile, stat, mkdir } from 'fs/promises';

import svg2ico from 'svg-to-ico';
import path    from 'path';
import sharp   from 'sharp';

export async function favicon({ 
  favicon  = './favicon.svg', 
  icoSizes = [16, 32, 48, 64], 
  output   = './favicon.ico' 
}) {

  if (await stat(favicon)) {
    await mkdir(path.join(path.parse(output ?? favicon).dir)).catch(_ => null);
    
    // @ts-ignore: Expects wrong type in svg2ico itself
    await svg2ico({ input_name: favicon, output_name: output, sizes: icoSizes });
  }
}

export async function icons({
  favicon    = './favicon.svg', 
  iconSizes  = [64, 128, 256, 512], 
  background = { r: 255, g: 255, b: 255 }, 
  output     = './icon-[size].png'
}) {
  const dir = path.parse(output).dir;

  if (await stat(favicon)) {
    const svg = sharp(await readFile(favicon)).removeAlpha().flatten({background});

    await mkdir(dir).catch(_ => null);

    for (const size of iconSizes) {
      svg.clone().resize(size, size).toFile(
        path.join((output ?? favicon).replaceAll('[size]', size.toString()))
      );
    }
  } 

}