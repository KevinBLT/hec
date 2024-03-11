import { component, resource, templateByNode, templateByString } from '../../lib/index.js';

component('my-beer', {}, () => {

  const beer = resource(() => fetch('https://random-data-api.com/api/v2/beers').then(r => r.json()));

  const jsonText = beer.map(e => e && JSON.stringify(e, null, 2));
  
  return templateByString(`
    <div>
      <p>Is the beer still loading? - State: "{{ beer.state }}!"</p>
      <div data-if="beer">
        You can enjoy: {{ beer.name }}, {{ beer.style }} by {{ beer.brand }}
      </div>
      <pre data-if="beer">
        {{ jsonText }}
      </pre>
    </div>
    `, 
    { beer, jsonText }
  );

});

templateByNode(document);