import { memo, signal, templateByString } from '../../lib/index.js';

const birthYear = signal(1982);

const person = {
  name: 'Joey',
  birthYear,
  age: memo(() => new Date().getFullYear() - birthYear(), [ birthYear ])
};

setInterval(() => birthYear(Math.round(1950 + Math.random() * 50)), 1000);

document.body.append(
  templateByString(`<div><strong>{{ name }}, {{ age }}yo ({{ birthYear }})</strong></div>`, person)
);
