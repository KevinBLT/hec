import { templateByString } from '../../lib/index.js';

document.body.append(
  templateByString(
    `
      <a href="/a">A</a>
      <a href="/b">B</a>
      <a href="/b/x">B-X</a>
      <a href="/c">C</a>
      <a href="/a/b/c">A-B-C</a>
      <a href="/c/d">C-D</a>

      <div data-route="/a">= /A</div>

      <div data-route="/a/a/a/:b">= /:B</div>

      <div data-route="/(a|b|c)/*?">

        <div>A / B</div>

        <div data-route="/"> / </div>

        <div data-route="x">(A | B) / X</div>
      </div>

      <div data-route="/a/b/c">
        <div>A / B / C</div>

        <div data-route="./*?">:)</div>
      </div>
      
    `
  )
);
