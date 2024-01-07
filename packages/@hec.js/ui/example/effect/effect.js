import { effect, memo, signal, templateByString } from '../../lib/index.js';

const birthYear = signal(1982);

const person = {
  name: 'Joey',
  birthYear
};

setInterval(() => birthYear(Math.round(1950 + Math.random() * 50)), 1000);

document.body.append(
  templateByString(`<div><strong>{{ name }}, <span id="effect-target"></span>yo ({{ birthYear }})</strong></div>`, person)
);


// Effect can be registered with signals anywhere
effect(() => {
  const f = document.getElementById('effect-target');
  
  if (f) {
    f.textContent = (new Date().getFullYear() - birthYear()).toString();
  }

}, [ birthYear ]);
