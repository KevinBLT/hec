import { component, templateByString } from '../../lib/index.js';

component('my-counter', { count: 0 }, (props) => {
  
  return templateByString(
    `<div data-on="click">You clicked {{ count }} times !</div>`, 
    {
      count: props.count,
      click: () => props.count(props.count() + 1)
    }
  );
});