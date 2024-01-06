import { templateByName, pipes, signal } from '../lib/index.js';
import { generateRandomName } from './tools.js';

const count = 10;

document.querySelector('button').addEventListener('click', () => {
  
  if (location.pathname.endsWith('b')) {
    history.pushState(null, null, './index.html');
  } else {
    history.pushState(null, null, './b');
  }

});

for (const a of new Array(count).fill(null, 0, count)) {
  const name = signal(generateRandomName()),
        ml   = (c = Math.round(Math.random() * count)) => new Array(c).fill(name, 0, c),
        list = signal(ml());

  pipes['date'] = (v) => new Intl.DateTimeFormat('de-DE', { dateStyle: 'short' }).format(v);

  document.body.append(
    await templateByName('template.html', { 
      name,
      color: () => '#' + Math.round(Math.random() * 0xffffff).toString(16),
      list,
      date: new Date(),
      isLong: list.map(e => e.length > count / 2)
    })
  );

  setInterval(() => name(generateRandomName()), 1500 + Math.random() * 5000);
  setInterval(() => list(ml()), 1500 + Math.random() * 5000);
}