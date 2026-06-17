export type Difficulty = "easy" | "medium" | "hard";

export interface WordPair {
  normal: string;
  imposter: string;
}

const EASY_PAIRS: WordPair[] = [
  { normal: "Dog", imposter: "Wolf" },
  { normal: "Pizza", imposter: "Burger" },
  { normal: "Ocean", imposter: "River" },
  { normal: "Lion", imposter: "Tiger" },
  { normal: "Guitar", imposter: "Violin" },
  { normal: "Apple", imposter: "Pear" },
  { normal: "Castle", imposter: "Tower" },
  { normal: "Dragon", imposter: "Dinosaur" },
  { normal: "Soccer", imposter: "Rugby" },
  { normal: "Vampire", imposter: "Zombie" },
  { normal: "Diamond", imposter: "Ruby" },
  { normal: "Shark", imposter: "Dolphin" },
  { normal: "Volcano", imposter: "Earthquake" },
  { normal: "Pirate", imposter: "Ninja" },
  { normal: "Spaceship", imposter: "Rocket" },
  { normal: "Crown", imposter: "Helmet" },
  { normal: "Sword", imposter: "Axe" },
  { normal: "Thunder", imposter: "Lightning" },
  { normal: "Witch", imposter: "Wizard" },
  { normal: "Eagle", imposter: "Hawk" },
  { normal: "Desert", imposter: "Savanna" },
  { normal: "Panda", imposter: "Koala" },
  { normal: "Snowflake", imposter: "Raindrop" },
  { normal: "Explosion", imposter: "Fire" },
  { normal: "Mermaid", imposter: "Siren" },
];

const MEDIUM_PAIRS: WordPair[] = [
  { normal: "Coffee", imposter: "Tea" },
  { normal: "Basketball", imposter: "Volleyball" },
  { normal: "Laptop", imposter: "Tablet" },
  { normal: "Instagram", imposter: "Twitter" },
  { normal: "Prison", imposter: "Jail" },
  { normal: "Helicopter", imposter: "Airplane" },
  { normal: "Chef", imposter: "Cook" },
  { normal: "Library", imposter: "Bookstore" },
  { normal: "Sunglasses", imposter: "Goggles" },
  { normal: "Mountain", imposter: "Hill" },
  { normal: "Strawberry", imposter: "Raspberry" },
  { normal: "Sunset", imposter: "Sunrise" },
  { normal: "Tornado", imposter: "Hurricane" },
  { normal: "Cathedral", imposter: "Church" },
  { normal: "Surgeon", imposter: "Doctor" },
  { normal: "Champagne", imposter: "Wine" },
  { normal: "Submarine", imposter: "Boat" },
  { normal: "Yoga", imposter: "Pilates" },
  { normal: "Perfume", imposter: "Cologne" },
  { normal: "Cactus", imposter: "Succulent" },
  { normal: "Astronaut", imposter: "Cosmonaut" },
  { normal: "Saxophone", imposter: "Clarinet" },
  { normal: "Penguin", imposter: "Seal" },
  { normal: "Avocado", imposter: "Guacamole" },
  { normal: "Crocodile", imposter: "Alligator" },
];

const HARD_PAIRS: WordPair[] = [
  { normal: "Butter", imposter: "Margarine" },
  { normal: "Alligator", imposter: "Crocodile" },
  { normal: "Jail", imposter: "Prison" },
  { normal: "Ship", imposter: "Boat" },
  { normal: "College", imposter: "University" },
  { normal: "Sofa", imposter: "Couch" },
  { normal: "Soda", imposter: "Pop" },
  { normal: "Rabbit", imposter: "Hare" },
  { normal: "Wasp", imposter: "Bee" },
  { normal: "Frog", imposter: "Toad" },
  { normal: "Lamp", imposter: "Lantern" },
  { normal: "Ketchup", imposter: "Tomato Sauce" },
  { normal: "Sneakers", imposter: "Trainers" },
  { normal: "Rubbish", imposter: "Garbage" },
  { normal: "Autumn", imposter: "Fall" },
  { normal: "Trousers", imposter: "Pants" },
  { normal: "Bonnet", imposter: "Hood" },
  { normal: "Biscuit", imposter: "Cookie" },
  { normal: "Chemist", imposter: "Pharmacist" },
  { normal: "Tap", imposter: "Faucet" },
  { normal: "Motorway", imposter: "Highway" },
  { normal: "Flat", imposter: "Apartment" },
  { normal: "Lift", imposter: "Elevator" },
  { normal: "Postbox", imposter: "Mailbox" },
  { normal: "Chips", imposter: "Fries" },
];

const PAIR_MAP: Record<Difficulty, WordPair[]> = {
  easy: EASY_PAIRS,
  medium: MEDIUM_PAIRS,
  hard: HARD_PAIRS,
};

export function getRandomWordPair(difficulty: Difficulty): WordPair {
  const pairs = PAIR_MAP[difficulty];
  return pairs[Math.floor(Math.random() * pairs.length)];
}
