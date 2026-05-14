import builder from "../builder";

// Message type
builder.objectType("Message", {
  fields: (t) => ({
    id: t.exposeString("id"),
    senderId: t.exposeString("senderId"),
    receiverId: t.exposeString("receiverId"),
    roomId: t.exposeString("roomId"),
    body: t.exposeString("body"),
    read: t.exposeBoolean("read"),
    createdAt: t.exposeString("createdAt"),
  }),
});

// Notification type
builder.objectType("Notification", {
  fields: (t) => ({
    id: t.exposeString("id"),
    userId: t.exposeString("userId"),
    type: t.exposeString("type"),
    title: t.exposeString("title"),
    message: t.exposeString("message"),
    read: t.exposeBoolean("read"),
    createdAt: t.exposeString("createdAt"),
  }),
});

// Quote type
builder.objectType("Quote", {
  fields: (t) => ({
    id: t.exposeString("id"),
    content: t.exposeString("content"),
    author: t.exposeString("author"),
    category: t.exposeString("category"),
    likes: t.exposeInt("likes"),
    createdAt: t.exposeString("createdAt"),
  }),
});

// Recipe ingredient nested type
builder.objectType("RecipeIngredient", {
  fields: (t) => ({
    name: t.exposeString("name"),
    quantity: t.exposeString("quantity"),
    unit: t.exposeString("unit"),
  }),
});

// Recipe type
builder.objectType("Recipe", {
  fields: (t) => ({
    id: t.exposeString("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description"),
    prepTimeMinutes: t.exposeInt("prepTimeMinutes"),
    cookTimeMinutes: t.exposeInt("cookTimeMinutes"),
    servings: t.exposeInt("servings"),
    difficulty: t.exposeString("difficulty"),
    cuisine: t.exposeString("cuisine"),
    calories: t.exposeInt("calories"),
    tags: t.exposeStringList("tags"),
    ingredients: t.field({
      type: ["RecipeIngredient"],
      resolve: (recipe) => recipe.ingredients,
    }),
    instructions: t.exposeStringList("instructions"),
    image: t.exposeString("image"),
    rating: t.exposeFloat("rating"),
    createdAt: t.exposeString("createdAt"),
  }),
});

// Country type
builder.objectType("Country", {
  fields: (t) => ({
    id: t.exposeString("id"),
    name: t.exposeString("name"),
    code: t.exposeString("code"),
    capital: t.exposeString("capital"),
    region: t.exposeString("region"),
    subregion: t.exposeString("subregion"),
    population: t.exposeInt("population"),
    area: t.exposeInt("area"),
    currency: t.exposeString("currency"),
    language: t.exposeString("language"),
    flag: t.exposeString("flag"),
    createdAt: t.exposeString("createdAt"),
  }),
});

// Company type
builder.objectType("Company", {
  fields: (t) => ({
    id: t.exposeString("id"),
    name: t.exposeString("name"),
    industry: t.exposeString("industry"),
    description: t.exposeString("description"),
    website: t.exposeString("website"),
    email: t.exposeString("email"),
    phone: t.exposeString("phone"),
    address: t.exposeString("address"),
    foundedYear: t.exposeInt("foundedYear"),
    employees: t.exposeInt("employees"),
    revenue: t.exposeString("revenue"),
    logo: t.exposeString("logo"),
    createdAt: t.exposeString("createdAt"),
  }),
});

// Stock type
builder.objectType("Stock", {
  fields: (t) => ({
    id: t.exposeString("id"),
    symbol: t.exposeString("symbol"),
    name: t.exposeString("name"),
    price: t.exposeFloat("price"),
    change: t.exposeFloat("change"),
    changePercent: t.exposeFloat("changePercent"),
    open: t.exposeFloat("open"),
    high: t.exposeFloat("high"),
    low: t.exposeFloat("low"),
    volume: t.exposeInt("volume"),
    marketCap: t.exposeInt("marketCap"),
    exchange: t.exposeString("exchange"),
    updatedAt: t.exposeString("updatedAt"),
  }),
});

// Event type
builder.objectType("Event", {
  fields: (t) => ({
    id: t.exposeString("id"),
    title: t.exposeString("title"),
    description: t.exposeString("description"),
    category: t.exposeString("category"),
    location: t.exposeString("location"),
    address: t.exposeString("address"),
    startDate: t.exposeString("startDate"),
    endDate: t.exposeString("endDate"),
    organizer: t.exposeString("organizer"),
    attendees: t.exposeInt("attendees"),
    maxAttendees: t.exposeInt("maxAttendees"),
    price: t.exposeFloat("price"),
    isFree: t.exposeBoolean("isFree"),
    image: t.exposeString("image"),
    tags: t.exposeStringList("tags"),
    createdAt: t.exposeString("createdAt"),
  }),
});
