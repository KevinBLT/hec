import { component, templateByName } from '../../lib/index.js';

component('my-counter', { count: 0, camelCase: '' }, ({ count, camelCase }, node) => {

  console.log('EXECUTE')

  node.addEventListener('::mount', () => console.log(count()))

  let isDown = false;

  const mousedown = async () => {
    isDown = true;

    console.log(camelCase());

    while (isDown) {
      count(count() + 1);
      await new Promise(r => setTimeout(r, 16.6));
    }

  }

  return templateByName('./component.html', 
    {
      count,
      mousedown,
      mouseup: () => isDown = false,
      color: count.map(e => '#' + e.toString(16).padStart(6, '0')),
      bg: count.map(e => '#' + (e ^ 0xFFFFFF).toString(16).padStart(6, '0')),
    }
  );
});