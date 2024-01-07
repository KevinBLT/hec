import { signal, templateByString } from '../../lib/index.js';


const form = {
  name: signal(''),
  age: signal(0)
}

/*
  Signals can be bound by the [name] attribute or by [data-bind]
*/
document.body.append(
  templateByString(`
    <form>
      <label>Enter your name so you can see it as output</label><br>
      <input type="text" name="name" /><br><br>
      <label>Enter your age</label><br>
      <input data-bind="age" type="number" /><br><br>
      <output>Your name is: {{ name }}</output><br>
      <output>Your age is: {{ age }}</output><br>
    </form>
  `, form)
);