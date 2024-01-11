import { signal, templateByNode } from "../../lib/index.js";
import { generateRandomName } from "./util.js";


function makeList() {
  return Array.from({ length: 5 }, () => {
    return signal({
      name: signal(generateRandomName())
    });
  });
}

const persons = signal(makeList());

const nextList = () => {
  persons(makeList());
}

const nextPerson = () => {

  for (const p of persons()) {
    p({ name: signal(generateRandomName()) });
  }

}

const nextName = () => {
  for (const p of persons()) {
    p().name(generateRandomName());
  }
}

templateByNode(document.body, { 
  persons,
  nextList,
  nextName, 
  nextPerson,
});

