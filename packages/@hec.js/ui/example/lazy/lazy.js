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

component('my-test', {}, () => templateByString('<my-a data-lazy date="{{ date }}"></my-b>', { date: new Date().toString() }));

component('my-a', { date: '' }, (props) => templateByString(`
  
  <my-b data-lazy date="{{ date }}"></my-b>
  <div style="height: 1000px"></div>
  <my-b data-lazy date="{{ date }}"></my-b>
  <div style="height: 1000px"></div>
  <my-b data-lazy date="{{ date }}"></my-b>
  <div style="height: 1000px"></div>
  <my-b data-lazy date="{{ date }}"></my-b>

  {{ unkownTestValue }}

  <div data-for="let a of testWrongForValue"></div>

`, props));

component('my-b', { date: '' }, (props) => templateByString(`

  <span>{{ date }}</span>
  <my-c data-lazy date="{{ date }}"></my-c>

`, props));

component('my-c', { date: '' }, (props) => templateByString(`

  <span>OK: {{ date }}</span>

`, props));