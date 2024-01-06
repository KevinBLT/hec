import { open, stat } from 'fs/promises';

/**
 * @param {'prod' | 'dev' | 'test' | 'stage'} [mode='prod'] Mode used when reading the `.env.[mode]` files
 * @returns {Promise<{[key: string]: string}>}
 * 
 * @description
 * Reads all env files in the current working directory with the given mode in the follinwg order:  
 * `.env` => `.env.local` => `.env.[mode]` => `.env.[mode].local`  
 * 
 * If a file does not exist, it will be ignored. Values will be overwritten in the order above.
 */
export async function environment(mode = 'prod') {
  const envFiles = [
    `.env`, 
    `.env.local`, 
    `.env.${mode}`, 
    `.env.${mode}.local`
  ], env = {};

  for (const file of envFiles) {

    if (await stat(file).catch(_ => null)) {
      const fd = await open(file);

      for await (const line of fd.readLines()) {
        const beforeComment = line.split('#').at(0).trim();

        if (beforeComment) {
          const [key, value] = beforeComment.split('=');

          env[key.trim()] = value.trim();
        }
      }
    }
  }

  return env;
}