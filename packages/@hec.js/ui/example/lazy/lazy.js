import { component, signal, templateByNode, templateByString } from '../../lib/index.js';

const p = {
  name: 'Lazy...'
}

const lazy = async () => {
  let i = 1;
  
  for (const lazy of document.querySelectorAll('[hidden]')) {
    await new Promise(r => setTimeout(r, 1000));

    p.name += ` -> ${i++}`;

    lazy.removeAttribute('hidden');
  }

}

lazy();


document.body.addEventListener('::load', (ev) => console.log(ev));
document.body.addEventListener('::loaded', (ev) => console.log(ev));

templateByNode(document.body, p);

component('my-test', {}, () => {

  const date   = new Date().toJSON(),
        person = {
          name: 'Peter',
          age: signal(0, { id: 'person.age' })
        };

  const visible = person.age.map(e => e % 3 != 0 || true);

  setInterval(() => person.age(person.age() + 1), 1500);

  return templateByString('<my-a data-if="visible" data-lazy person="person" date="{{ date }}"></my-b>', { 
    date, person, visible
  });
});

component('my-a', { date: '', person: null }, (props) => templateByString(`
  <strong>{{ date }}, {{ person.name }} ist: {{ person.age }}</strong>
  <my-b data-lazy person="person" date="{{ date }}"></my-b>
  <div style="height: 1000px"></div>
  <my-b data-lazy person="person" date="{{ date }}"></my-b>
  <div style="height: 1000px"></div>
  <my-b data-lazy person="person" date="{{ date }}"></my-b>
  <div style="height: 1000px"></div>
  <my-b data-lazy person="person" date="{{ date }}"></my-b>

  {{ unkownTestValue }}

  <div data-for="let a of testWrongForValue"></div>

`, props));

component('my-b', { date: '', person: null }, (props) => templateByString(`

  <span>{{ date }}, {{ person.name }} ist: {{ person.age }}</span>
  <my-c data-lazy person="person" date="{{ date }}"></my-c>

`, props));

component('my-c', { date: '', person: null }, (props) => templateByString(`

  <span>OK: {{ date }}, {{ person.name }} ist: {{ person.age }}</span>

`, props));