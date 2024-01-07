import { component, resource, templateByString } from '../../lib/index.js';

component('my-beer', {}, () => {

  const beer = resource(
    () => fetch('https://random-data-api.com/api/v2/beers').then(r => r.json())
  );

  const jsonText = beer.value.map(e => e && JSON.stringify(e, null, 2));
  
  return templateByString(`
    <div>
      <p>Is the beer still loading? - Someone drunk: "{{ beer.loading }}!"</p>
      <div data-if="beer.value">
        You can enjoy: {{ beer.value.name }}, {{ beer.value.style }} by {{ beer.value.brand }}
      </div>
      <pre data-if="beer.value">
        {{ jsonText }}
      </pre>
    </div>
    `, 
    { beer, jsonText }
  );

});