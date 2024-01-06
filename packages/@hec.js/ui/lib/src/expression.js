/**
 * @typedef {{ meta: { [key: string]: string }, text: string, prop?: string }} Expression
 * 
 * @param { string } text 
 * @returns {Expression}
 */
export function expression(text) {
  const parts = text.matchAll(/([^ {}\s]+)/g),
        exp   = {
          meta: {},
          text: text,
          prop: null
        }

  for (const e of parts) {
    if (e[1].includes('=')) {
      const p = e[1].split('=');
      
      exp.meta[p[0]] = p[1].replaceAll(/'|"/g, '');
    } else {
      exp.prop = e[1];
    }
  }

  return exp;
}