# HEC: [H]TML [E]SX [C]SS

###  A framework for framework haters!

*Philosophy & Motivation*
- Not build process
- Codebase should shrink over time not grow: Using proposals that will come to the browser
- VanillaJS with JSDoc
- The server is always right - what's rendered will fill the values
- Libraries that work with existing code/websites
- Only valid HTML
- No JS lock-in: Server side parts should be there for different langues with the same HTML
- HTML is the king, markup describes the code
- Dynamic: Plugins and Pipes can be injected, different HTML templates for the same code can be used

## Install

CLI: `npm i 'https://gitpkg.now.sh/KevinBLT/hec/packages/@hec.js/cli?main'`
UI: `npm i 'https://gitpkg.now.sh/KevinBLT/hec/packages/@hec.js/ui?main'`
API: `npm i 'https://gitpkg.now.sh/KevinBLT/hec/packages/@hec.js/api?main'`
ENV: `npm i 'https://gitpkg.now.sh/KevinBLT/hec/packages/@hec.js/env?main'`

## General principles

HTML describes a template by using placeholder (https://github.com/WICG/webcomponents/blob/gh-pages/proposals/DOM-Parts-Declarative-Template.md), which will be used to insert the properties given in the template context.

```html
<div id="div">Hello {{ name }}!</div>

// in *.js
<script type="module">
  import { templateByNode } from "url/to/hec.js";
  
  templateByNode(div, { name: 'Joey' });
</script>
```


## Examples

**Component**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/component

**Effect**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/effect

**Events**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/events

**Form**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/form

**Inline**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/inline

**List**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/list

**Memo**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/memo

**Plugins**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/plugins

**Resource**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/resource

**Signal**
https://kevinblt.github.io/hec/packages/@hec.js/ui/example/signal