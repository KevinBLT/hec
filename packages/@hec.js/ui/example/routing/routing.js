import { templateByString } from '../../lib/index.js';

document.body.append(
  templateByString(
    `
      <a data-on="click" href="/a">A</a>
      <a data-on="click" href="/b">B</a>
      <a data-on="click" href="/b/x">B-X</a>
      <a data-on="click" href="/c">C</a>
      <a data-on="click" href="/a/b/c">A-B-C</a>
      <a data-on="click" href="/c/d">C-D</a>

      <div data-route="/a">= /A</div>

      <div data-route="/:b">= /:B</div>

      <div data-route="/(a|b)/*?">
        <div>A / B</div>

        <div data-route="x">(A | B) / X</div>
      </div>

      <div data-route="/a/b/c">
        <div>A / B / C</div>

        <div data-route="./*?">:)</div>
      </div>
      
    `
  )
);
