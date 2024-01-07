import { signal, templateByString } from '../../lib/index.js';

function randomLotNumber() {
  return Math.round(Math.random() * 10000).toString().padStart(5, '0');
}

const lotNumber = signal(randomLotNumber());

const someWinner = {
  name: 'Joey',
  age: 32,
  lot: {
    number: lotNumber,
    win: lotNumber.map((e) => !!e.match(/123|456|789|345|567|678/)),
  },
};

setInterval(() => lotNumber(randomLotNumber()), 2000);

document.body.append(
  templateByString(
    `
      <div>
        <strong>{{ name }}, {{ age }}yo</strong>
        <div>
          Number: {{ lot.number }}
        </div>
        <h3 data-if="lot.win">Winner!!</h3>
      </div>
    `,
    someWinner
  )
);
