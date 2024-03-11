import { templateByName, templateByNode, view } from '../../lib/index.js';

view('a', { text: 'Hi' }, (props) => {
  
  const list = Array.from({ length: 2 }, () => ({ text: props.text }));

  return templateByName('./a.html', { list, text: props.text });
});

templateByNode(document);