import { component, templateByName } from '../../lib/index.js';

component('c-c', { person: { text: '' } }, (props) => {

  return templateByName('./c.html', {
    text: () => props.person()?.text
  });
});