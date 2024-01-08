export function generateRandomName(type = 'first') {
  const firstNames = ["John", "Jane", "Mike", "Emily", "David", "Sarah", "Alex", "Olivia", "Chris", "Eva"];
  const lastNames = ["Doe", "Smith", "Johnson", "Taylor", "Williams", "Brown", "Miller", "Davis", "Garcia", "Jones"];

  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}