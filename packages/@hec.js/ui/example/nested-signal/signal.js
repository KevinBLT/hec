import { signal, templateByNode } from "../../lib/index.js";
import { generateRandomName } from "./util.js";

const person = signal({
  name: signal(generateRandomName())
})

const nextName = () => {
  person().name(generateRandomName());
}

templateByNode(document.body, { 
  person, 
  nextName, 
  nextPerson: () => person({ name: signal(generateRandomName()) }) 
});