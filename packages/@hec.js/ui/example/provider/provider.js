import { provider, signal, templateByString } from '../../lib/index.js';

const list = [
  'Person A',
  'Person B',
  'Person C'
];

const select = (event) => {
  selected(event.target.textContent); 

  console.log(event.target.textContent);
}

const next = () => {
  const i = list.indexOf(selected());

  selected(list[i + 1 >= list.length ? 0 : i + 1]);
};

const selected = signal(null);

const isSelected = provider((e, meta) => {
  console.log(e, selected(), meta);

  return e == selected() ? '--selected' : '';
}, [ selected ]);


document.body.append(
  templateByString(
    `
      <ul>
        <li data-on="click:select" class="item {{ isSelected(e) foo='bar' }}" data-for="e of list">{{ e }}</li>
      </ul>
      <button data-on="click:next" >RANDOM</botton>
    `,
    { list, isSelected, select, next }
  )
);
