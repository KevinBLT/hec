import { memo, signal, templateByString } from '../../lib/index.js';

const text = signal('Click!');

const context = { text, click: () => text('OK :)') };

document.body.append(
  templateByString(`<div data-on.click="click">{{ text }}</div>`, context)
);
