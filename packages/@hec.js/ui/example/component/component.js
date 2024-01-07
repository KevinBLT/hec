import { component, templateByName } from '../../lib/index.js';

component('my-counter', { count: 0 }, ({ count }) => {

  let isDown = false;

  return templateByName(
    new URL('./component.html', import.meta.url), 
    {
      count,
      mousedown: async () => {
        isDown = true;

        while (isDown) {
          count(count() + 1);
          await new Promise(r => setTimeout(r, 25));
        }

      },
      mouseup: () => isDown = false,
      color: count.map(e => '#' + e.toString(16).padStart(6, '0')),
      bg: count.map(e => '#' + (e ^ 0xFFFFFF).toString(16).padStart(6, '0')),
    }
  );
});