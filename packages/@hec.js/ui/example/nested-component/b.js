import { component, templateByName } from '../../lib/index.js';

component('c-b', { text: '' }, (props) => {

  setTimeout(() => props.text( props.text() + ' !!'), 2500);

  return templateByName('./b.html', props);
});