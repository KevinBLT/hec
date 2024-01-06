export function generateRandomName() {
  const adjectives = ['Red', 'Green', 'Blue', 'Happy', 'Sunny', 'Magical'];
  const nouns = ['Cat', 'Dog', 'Bird', 'Moon', 'Star', 'Mountain'];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${randomAdjective} ${randomNoun}`;
}
