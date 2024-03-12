import { pipes, provider, signal, templateByString } from '../../lib/index.js';

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

const isSelected = provider((e) => e == selected(), [ selected ]);

pipes['test'] = (options) => options.param;

document.body.append(
  templateByString(
    `
      <ul>
        <li data-on.click="select" data-class.--selected="isSelected(e)" class="item" data-for="e of list">{{ e }}</li>
      </ul>
      <div data-if="{{}}">Hi!</div>
      <button data-on.click="next" >RANDOM</botton>
    `,
    { list, isSelected, select, next }
  )
);
