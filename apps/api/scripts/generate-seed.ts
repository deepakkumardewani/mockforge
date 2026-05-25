import { faker } from "@faker-js/faker";
import { writeFileSync } from "fs";
import { join } from "path";

faker.seed(42);

const SEED_COUNT = 100;
const OUT_DIR = join(import.meta.dir, "../src/data/seed");

// ── helpers ────────────────────────────────────────────────────────────────

function write(entity: string, data: unknown[]) {
  writeFileSync(join(OUT_DIR, `${entity}.json`), JSON.stringify(data, null, 2));
  console.log(`✓ ${entity}.json  (${data.length} records)`);
}

// ── users ──────────────────────────────────────────────────────────────────

const users = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  username: faker.internet.username(),
  phone: faker.phone.number(),
  avatar: faker.image.avatar(),
  birthDate: faker.date.birthdate({ min: 18, max: 80, mode: "age" }).toISOString(),
  address: {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode(),
    country: faker.location.country(),
  },
  company: faker.company.name(),
  jobTitle: faker.person.jobTitle(),
  createdAt: faker.date.recent().toISOString(),
}));
write("users", users);

// ── products ───────────────────────────────────────────────────────────────

const products = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price({ min: 10, max: 500, dec: 2 })),
  discountPercentage: faker.number.int({ min: 0, max: 50 }),
  rating: parseFloat(faker.number.float({ min: 0, max: 5 }).toFixed(1)),
  stock: faker.number.int({ min: 0, max: 200 }),
  brand: faker.company.name(),
  category: faker.commerce.department(),
  thumbnail: faker.image.url(),
  images: [faker.image.url(), faker.image.url(), faker.image.url()],
  sku: faker.string.alphanumeric(8).toUpperCase(),
  weight: parseFloat(faker.number.float({ min: 0, max: 10 }).toFixed(2)),
  createdAt: faker.date.recent().toISOString(),
}));
write("products", products);

// ── posts ──────────────────────────────────────────────────────────────────

const posts = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  title: faker.lorem.sentence(),
  body: faker.lorem.paragraphs(3),
  userId: faker.number.int({ min: 1, max: 100 }),
  tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
  reactions: faker.number.int({ min: 0, max: 500 }),
  views: faker.number.int({ min: 0, max: 10000 }),
  createdAt: faker.date.recent().toISOString(),
}));
write("posts", posts);

// ── comments ───────────────────────────────────────────────────────────────

const comments = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  postId: faker.number.int({ min: 1, max: 100 }),
  userId: faker.number.int({ min: 1, max: 100 }),
  body: faker.lorem.paragraphs(1),
  author: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: faker.date.recent().toISOString(),
}));
write("comments", comments);

// ── todos ──────────────────────────────────────────────────────────────────

const priorities = ["low", "medium", "high"] as const;
const todos = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  userId: faker.number.int({ min: 1, max: 100 }),
  todo: faker.lorem.sentence(),
  completed: faker.datatype.boolean(),
  priority: priorities[faker.number.int({ min: 0, max: 2 })],
  dueDate: faker.date.future().toISOString(),
  createdAt: faker.date.recent().toISOString(),
}));
write("todos", todos);

// ── carts ──────────────────────────────────────────────────────────────────

const carts = Array.from({ length: SEED_COUNT }, (_, i) => {
  const totalProducts = faker.number.int({ min: 1, max: 10 });
  const cartProducts = Array.from({ length: totalProducts }, () => {
    const price = parseFloat(faker.commerce.price({ min: 5, max: 200, dec: 2 }));
    const quantity = faker.number.int({ min: 1, max: 5 });
    const discountPercentage = faker.number.int({ min: 0, max: 30 });
    const total = price * quantity;
    const discountedTotal = total * (1 - discountPercentage / 100);
    return {
      productId: faker.number.int({ min: 1, max: 100 }),
      title: faker.commerce.productName(),
      price,
      quantity,
      total,
      discountPercentage,
      discountedTotal,
      thumbnail: faker.image.url(),
    };
  });
  return {
    id: i + 1,
    userId: faker.number.int({ min: 1, max: 100 }),
    products: cartProducts,
    total: cartProducts.reduce((s, p) => s + p.total, 0),
    discountedTotal: cartProducts.reduce((s, p) => s + p.discountedTotal, 0),
    totalProducts,
    totalQuantity: cartProducts.reduce((s, p) => s + p.quantity, 0),
    createdAt: faker.date.recent().toISOString(),
  };
});
write("carts", carts);

// ── messages ───────────────────────────────────────────────────────────────

const messages = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  senderId: faker.number.int({ min: 1, max: 100 }),
  receiverId: faker.number.int({ min: 1, max: 100 }),
  roomId: faker.number.int({ min: 1, max: 20 }),
  body: faker.lorem.paragraphs(1),
  read: faker.datatype.boolean(),
  createdAt: faker.date.recent().toISOString(),
}));
write("messages", messages);

// ── notifications ──────────────────────────────────────────────────────────

const notificationTypes = ["info", "warning", "success", "error"] as const;
const notifications = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  userId: faker.number.int({ min: 1, max: 100 }),
  type: notificationTypes[faker.number.int({ min: 0, max: 3 })],
  title: faker.lorem.sentence(),
  message: faker.lorem.paragraphs(1),
  read: faker.datatype.boolean(),
  createdAt: faker.date.recent().toISOString(),
}));
write("notifications", notifications);

// ── quotes ─────────────────────────────────────────────────────────────────

const quotes = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  content: faker.lorem.sentences(2),
  author: faker.person.fullName(),
  category: faker.lorem.word(),
  likes: faker.number.int({ min: 0, max: 1000 }),
  createdAt: faker.date.recent().toISOString(),
}));
write("quotes", quotes);

// ── recipes ────────────────────────────────────────────────────────────────

const difficulties = ["easy", "medium", "hard"] as const;
const recipes = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  name: faker.lorem.words(2),
  description: faker.lorem.paragraphs(1),
  prepTimeMinutes: faker.number.int({ min: 5, max: 60 }),
  cookTimeMinutes: faker.number.int({ min: 10, max: 120 }),
  servings: faker.number.int({ min: 1, max: 8 }),
  difficulty: difficulties[faker.number.int({ min: 0, max: 2 })],
  cuisine: faker.lorem.word(),
  calories: faker.number.int({ min: 100, max: 1000 }),
  tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
  ingredients: Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () => ({
    name: faker.lorem.word(),
    quantity: faker.number.int({ min: 1, max: 5 }).toString(),
    unit: faker.helpers.arrayElement(["cup", "tbsp", "tsp", "g", "ml", "oz"]),
  })),
  instructions: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () =>
    faker.lorem.sentence(),
  ),
  image: faker.image.url(),
  rating: parseFloat(faker.number.float({ min: 0, max: 5 }).toFixed(1)),
  createdAt: faker.date.recent().toISOString(),
}));
write("recipes", recipes);

// ── countries ──────────────────────────────────────────────────────────────

const countries = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  name: faker.location.country(),
  code: faker.location.countryCode("alpha-2"),
  capital: faker.location.city(),
  region: faker.lorem.word(),
  subregion: faker.lorem.word(),
  population: faker.number.int({ min: 100000, max: 1000000000 }),
  area: faker.number.int({ min: 1000, max: 10000000 }),
  currency: faker.finance.currencyCode(),
  language: faker.lorem.word(),
  flag: faker.helpers.arrayElement(["🇺🇸", "🇬🇧", "🇨🇦", "🇫🇷", "🇩🇪", "🇮🇳", "🇯🇵", "🇦🇺"]),
  createdAt: faker.date.recent().toISOString(),
}));
write("countries", countries);

// ── companies ──────────────────────────────────────────────────────────────

const companies = Array.from({ length: SEED_COUNT }, (_, i) => ({
  id: i + 1,
  name: faker.company.name(),
  industry: faker.lorem.word(),
  description: faker.lorem.paragraphs(1),
  website: faker.internet.url(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
  foundedYear: faker.number.int({ min: 1950, max: 2024 }),
  employees: faker.number.int({ min: 10, max: 50000 }),
  revenue: `$${faker.number.int({ min: 100000, max: 10000000000 }).toLocaleString()}`,
  logo: faker.image.url(),
  createdAt: faker.date.recent().toISOString(),
}));
write("companies", companies);

// ── stocks ─────────────────────────────────────────────────────────────────

const STOCK_SYMBOLS = [
  "AAPL",
  "TSLA",
  "MSFT",
  "AMZN",
  "GOOGL",
  "META",
  "NVDA",
  "AMD",
  "NFLX",
  "SHOP",
  "JPM",
  "V",
  "MA",
  "DIS",
  "BA",
];
const STOCK_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  TSLA: "Tesla Inc.",
  MSFT: "Microsoft Corporation",
  AMZN: "Amazon.com Inc.",
  GOOGL: "Alphabet Inc.",
  META: "Meta Platforms Inc.",
  NVDA: "NVIDIA Corporation",
  AMD: "Advanced Micro Devices",
  NFLX: "Netflix Inc.",
  SHOP: "Shopify Inc.",
  JPM: "JPMorgan Chase",
  V: "Visa Inc.",
  MA: "Mastercard Inc.",
  DIS: "The Walt Disney Company",
  BA: "The Boeing Company",
};

const stocks = Array.from({ length: SEED_COUNT }, (_, i) => {
  const symbol = STOCK_SYMBOLS[i % STOCK_SYMBOLS.length];
  const price = parseFloat(faker.number.float({ min: 50, max: 550 }).toFixed(2));
  const changePercent = parseFloat(faker.number.float({ min: -5, max: 5 }).toFixed(2));
  const change = parseFloat((price * (changePercent / 100)).toFixed(2));
  return {
    id: i + 1,
    symbol,
    name: STOCK_NAMES[symbol] ?? faker.company.name(),
    price,
    change,
    changePercent,
    open: parseFloat((price * faker.number.float({ min: 0.95, max: 1.05 })).toFixed(2)),
    high: parseFloat((price * faker.number.float({ min: 1, max: 1.15 })).toFixed(2)),
    low: parseFloat((price * faker.number.float({ min: 0.85, max: 1 })).toFixed(2)),
    volume: faker.number.int({ min: 1000000, max: 100000000 }),
    marketCap: faker.number.int({ min: 100000000, max: 3000000000000 }),
    exchange: faker.helpers.arrayElement(["NYSE", "NASDAQ"]),
    updatedAt: faker.date.recent().toISOString(),
  };
});
write("stocks", stocks);

// ── events ─────────────────────────────────────────────────────────────────

const eventCategories = [
  "conference",
  "meetup",
  "webinar",
  "concert",
  "sports",
  "festival",
] as const;
const events = Array.from({ length: SEED_COUNT }, (_, i) => {
  const startDate = faker.date.future();
  const endDate = new Date(
    startDate.getTime() + faker.number.int({ min: 1, max: 7 }) * 24 * 60 * 60 * 1000,
  );
  const maxAttendees = faker.number.int({ min: 50, max: 10000 });
  const isFree = faker.datatype.boolean();
  return {
    id: i + 1,
    title: faker.lorem.words(3),
    description: faker.lorem.paragraphs(2),
    category: eventCategories[faker.number.int({ min: 0, max: 5 })],
    location: faker.location.city(),
    address: faker.location.streetAddress(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    organizer: faker.person.fullName(),
    attendees: faker.number.int({ min: 0, max: maxAttendees }),
    maxAttendees,
    price: isFree ? 0 : parseFloat(faker.commerce.price({ min: 0, max: 500, dec: 2 })),
    isFree,
    image: faker.image.url(),
    tags: [faker.lorem.word(), faker.lorem.word()],
    createdAt: faker.date.recent().toISOString(),
  };
});
write("events", events);

console.log("\nSeed generation complete.");
