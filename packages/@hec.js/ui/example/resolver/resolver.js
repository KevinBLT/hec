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

const random = () => {
  selected(list[Math.floor(Math.random() * list.length)]); 
}

const selected = signal(null);

const isSelected = provider((e) => {
  console.log(e, selected());

  return e == selected() ? '--selected' : '';
}, [ selected ]);


document.body.append(
  templateByString(
    `
      <ul>
        <li data-on="click:select" class="item {{ isSelected(e) }}" data-for="e of list">{{ e }}</li>
      </ul>
      <button data-on="click:random" >RANDOM</botton>
    `,
    { list, isSelected, select, random }
  )
);
