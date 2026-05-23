/**
 * Playground catalogue — static discovery data for all entities and their endpoints.
 * Matches the API structure in apps/api/src/routes/rest/
 */

export const ENTITIES = [
  "users",
  "products",
  "posts",
  "comments",
  "todos",
  "carts",
  "messages",
  "notifications",
  "quotes",
  "recipes",
  "countries",
  "companies",
  "stocks",
  "events",
] as const;

export type Entity = (typeof ENTITIES)[number];

export interface RestEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
}

/**
 * REST endpoints covering all 14 entities × 6 patterns:
 * - GET list
 * - GET search
 * - GET by-id
 * - POST create
 * - PUT by-id update
 * - DELETE by-id
 * Plus GET /stats
 */
export const REST_ENDPOINTS: readonly RestEndpoint[] = [
  // Users
  { method: "GET", path: "/users", description: "List all users" },
  { method: "GET", path: "/users/search", description: "Search users" },
  { method: "GET", path: "/users/:id", description: "Get user by ID" },
  { method: "POST", path: "/users", description: "Create new user" },
  { method: "PUT", path: "/users/:id", description: "Update user" },
  { method: "DELETE", path: "/users/:id", description: "Delete user" },

  // Products
  { method: "GET", path: "/products", description: "List all products" },
  { method: "GET", path: "/products/search", description: "Search products" },
  { method: "GET", path: "/products/:id", description: "Get product by ID" },
  { method: "POST", path: "/products", description: "Create new product" },
  { method: "PUT", path: "/products/:id", description: "Update product" },
  { method: "DELETE", path: "/products/:id", description: "Delete product" },

  // Posts
  { method: "GET", path: "/posts", description: "List all posts" },
  { method: "GET", path: "/posts/search", description: "Search posts" },
  { method: "GET", path: "/posts/:id", description: "Get post by ID" },
  { method: "POST", path: "/posts", description: "Create new post" },
  { method: "PUT", path: "/posts/:id", description: "Update post" },
  { method: "DELETE", path: "/posts/:id", description: "Delete post" },

  // Comments
  { method: "GET", path: "/comments", description: "List all comments" },
  { method: "GET", path: "/comments/search", description: "Search comments" },
  { method: "GET", path: "/comments/:id", description: "Get comment by ID" },
  { method: "POST", path: "/comments", description: "Create new comment" },
  { method: "PUT", path: "/comments/:id", description: "Update comment" },
  { method: "DELETE", path: "/comments/:id", description: "Delete comment" },

  // Todos
  { method: "GET", path: "/todos", description: "List all todos" },
  { method: "GET", path: "/todos/search", description: "Search todos" },
  { method: "GET", path: "/todos/:id", description: "Get todo by ID" },
  { method: "POST", path: "/todos", description: "Create new todo" },
  { method: "PUT", path: "/todos/:id", description: "Update todo" },
  { method: "DELETE", path: "/todos/:id", description: "Delete todo" },

  // Carts
  { method: "GET", path: "/carts", description: "List all carts" },
  { method: "GET", path: "/carts/search", description: "Search carts" },
  { method: "GET", path: "/carts/:id", description: "Get cart by ID" },
  { method: "POST", path: "/carts", description: "Create new cart" },
  { method: "PUT", path: "/carts/:id", description: "Update cart" },
  { method: "DELETE", path: "/carts/:id", description: "Delete cart" },

  // Messages
  { method: "GET", path: "/messages", description: "List all messages" },
  { method: "GET", path: "/messages/search", description: "Search messages" },
  { method: "GET", path: "/messages/:id", description: "Get message by ID" },
  { method: "POST", path: "/messages", description: "Create new message" },
  { method: "PUT", path: "/messages/:id", description: "Update message" },
  { method: "DELETE", path: "/messages/:id", description: "Delete message" },

  // Notifications
  { method: "GET", path: "/notifications", description: "List all notifications" },
  { method: "GET", path: "/notifications/search", description: "Search notifications" },
  { method: "GET", path: "/notifications/:id", description: "Get notification by ID" },
  { method: "POST", path: "/notifications", description: "Create new notification" },
  { method: "PUT", path: "/notifications/:id", description: "Update notification" },
  { method: "DELETE", path: "/notifications/:id", description: "Delete notification" },

  // Quotes
  { method: "GET", path: "/quotes", description: "List all quotes" },
  { method: "GET", path: "/quotes/search", description: "Search quotes" },
  { method: "GET", path: "/quotes/:id", description: "Get quote by ID" },
  { method: "POST", path: "/quotes", description: "Create new quote" },
  { method: "PUT", path: "/quotes/:id", description: "Update quote" },
  { method: "DELETE", path: "/quotes/:id", description: "Delete quote" },

  // Recipes
  { method: "GET", path: "/recipes", description: "List all recipes" },
  { method: "GET", path: "/recipes/search", description: "Search recipes" },
  { method: "GET", path: "/recipes/:id", description: "Get recipe by ID" },
  { method: "POST", path: "/recipes", description: "Create new recipe" },
  { method: "PUT", path: "/recipes/:id", description: "Update recipe" },
  { method: "DELETE", path: "/recipes/:id", description: "Delete recipe" },

  // Countries
  { method: "GET", path: "/countries", description: "List all countries" },
  { method: "GET", path: "/countries/search", description: "Search countries" },
  { method: "GET", path: "/countries/:id", description: "Get country by ID" },
  { method: "POST", path: "/countries", description: "Create new country" },
  { method: "PUT", path: "/countries/:id", description: "Update country" },
  { method: "DELETE", path: "/countries/:id", description: "Delete country" },

  // Companies
  { method: "GET", path: "/companies", description: "List all companies" },
  { method: "GET", path: "/companies/search", description: "Search companies" },
  { method: "GET", path: "/companies/:id", description: "Get company by ID" },
  { method: "POST", path: "/companies", description: "Create new company" },
  { method: "PUT", path: "/companies/:id", description: "Update company" },
  { method: "DELETE", path: "/companies/:id", description: "Delete company" },

  // Stocks
  { method: "GET", path: "/stocks", description: "List all stocks" },
  { method: "GET", path: "/stocks/search", description: "Search stocks" },
  { method: "GET", path: "/stocks/:id", description: "Get stock by ID" },
  { method: "POST", path: "/stocks", description: "Create new stock" },
  { method: "PUT", path: "/stocks/:id", description: "Update stock" },
  { method: "DELETE", path: "/stocks/:id", description: "Delete stock" },

  // Events
  { method: "GET", path: "/events", description: "List all events" },
  { method: "GET", path: "/events/search", description: "Search events" },
  { method: "GET", path: "/events/:id", description: "Get event by ID" },
  { method: "POST", path: "/events", description: "Create new event" },
  { method: "PUT", path: "/events/:id", description: "Update event" },
  { method: "DELETE", path: "/events/:id", description: "Delete event" },

  // Stats
  { method: "GET", path: "/stats", description: "Get system statistics" },
];

export interface GraphQLField {
  type: string;
  selectableScalars?: string[];
}

/**
 * GraphQL root fields per entity with selectable scalar sub-fields.
 * Each entity has list query, single query, and CRUD mutations.
 */
export const GRAPHQL_FIELDS: Record<Entity, Record<string, GraphQLField>> = {
  users: {
    users: { type: "[User!]!", selectableScalars: ["id", "firstName", "lastName", "email"] },
    user: { type: "User", selectableScalars: ["id", "firstName", "lastName", "email"] },
    createUser: {
      type: "User!",
      selectableScalars: ["id", "firstName", "lastName", "email"],
    },
    updateUser: {
      type: "User!",
      selectableScalars: ["id", "firstName", "lastName", "email"],
    },
    deleteUser: { type: "Boolean!", selectableScalars: [] },
  },
  products: {
    products: { type: "[Product!]!", selectableScalars: ["id", "title", "price", "stock"] },
    product: { type: "Product", selectableScalars: ["id", "title", "price", "stock"] },
    createProduct: {
      type: "Product!",
      selectableScalars: ["id", "title", "price", "stock"],
    },
    updateProduct: {
      type: "Product!",
      selectableScalars: ["id", "title", "price", "stock"],
    },
    deleteProduct: { type: "Boolean!", selectableScalars: [] },
  },
  posts: {
    posts: { type: "[Post!]!", selectableScalars: ["id", "title", "body", "userId"] },
    post: { type: "Post", selectableScalars: ["id", "title", "body", "userId"] },
    createPost: {
      type: "Post!",
      selectableScalars: ["id", "title", "body", "userId"],
    },
    updatePost: {
      type: "Post!",
      selectableScalars: ["id", "title", "body", "userId"],
    },
    deletePost: { type: "Boolean!", selectableScalars: [] },
  },
  comments: {
    comments: { type: "[Comment!]!", selectableScalars: ["id", "postId", "userId", "body"] },
    comment: { type: "Comment", selectableScalars: ["id", "postId", "userId", "body"] },
    createComment: {
      type: "Comment!",
      selectableScalars: ["id", "postId", "userId", "body"],
    },
    updateComment: {
      type: "Comment!",
      selectableScalars: ["id", "postId", "userId", "body"],
    },
    deleteComment: { type: "Boolean!", selectableScalars: [] },
  },
  todos: {
    todos: { type: "[Todo!]!", selectableScalars: ["id", "userId", "todo", "completed"] },
    todo: { type: "Todo", selectableScalars: ["id", "userId", "todo", "completed"] },
    createTodo: {
      type: "Todo!",
      selectableScalars: ["id", "userId", "todo", "completed"],
    },
    updateTodo: {
      type: "Todo!",
      selectableScalars: ["id", "userId", "todo", "completed"],
    },
    deleteTodo: { type: "Boolean!", selectableScalars: [] },
  },
  carts: {
    carts: { type: "[Cart!]!", selectableScalars: ["id", "userId", "total"] },
    cart: { type: "Cart", selectableScalars: ["id", "userId", "total"] },
    createCart: { type: "Cart!", selectableScalars: ["id", "userId", "total"] },
    updateCart: { type: "Cart!", selectableScalars: ["id", "userId", "total"] },
    deleteCart: { type: "Boolean!", selectableScalars: [] },
  },
  messages: {
    messages: {
      type: "[Message!]!",
      selectableScalars: ["id", "senderId", "receiverId", "body"],
    },
    message: { type: "Message", selectableScalars: ["id", "senderId", "receiverId", "body"] },
    createMessage: {
      type: "Message!",
      selectableScalars: ["id", "senderId", "receiverId", "body"],
    },
    updateMessage: {
      type: "Message!",
      selectableScalars: ["id", "senderId", "receiverId", "body"],
    },
    deleteMessage: { type: "Boolean!", selectableScalars: [] },
  },
  notifications: {
    notifications: {
      type: "[Notification!]!",
      selectableScalars: ["id", "userId", "message", "read"],
    },
    notification: {
      type: "Notification",
      selectableScalars: ["id", "userId", "message", "read"],
    },
    createNotification: {
      type: "Notification!",
      selectableScalars: ["id", "userId", "message", "read"],
    },
    updateNotification: {
      type: "Notification!",
      selectableScalars: ["id", "userId", "message", "read"],
    },
    deleteNotification: { type: "Boolean!", selectableScalars: [] },
  },
  quotes: {
    quotes: { type: "[Quote!]!", selectableScalars: ["id", "author", "text"] },
    quote: { type: "Quote", selectableScalars: ["id", "author", "text"] },
    createQuote: { type: "Quote!", selectableScalars: ["id", "author", "text"] },
    updateQuote: { type: "Quote!", selectableScalars: ["id", "author", "text"] },
    deleteQuote: { type: "Boolean!", selectableScalars: [] },
  },
  recipes: {
    recipes: { type: "[Recipe!]!", selectableScalars: ["id", "name", "ingredients"] },
    recipe: { type: "Recipe", selectableScalars: ["id", "name", "ingredients"] },
    createRecipe: { type: "Recipe!", selectableScalars: ["id", "name", "ingredients"] },
    updateRecipe: { type: "Recipe!", selectableScalars: ["id", "name", "ingredients"] },
    deleteRecipe: { type: "Boolean!", selectableScalars: [] },
  },
  countries: {
    countries: { type: "[Country!]!", selectableScalars: ["id", "name", "code"] },
    country: { type: "Country", selectableScalars: ["id", "name", "code"] },
    createCountry: { type: "Country!", selectableScalars: ["id", "name", "code"] },
    updateCountry: { type: "Country!", selectableScalars: ["id", "name", "code"] },
    deleteCountry: { type: "Boolean!", selectableScalars: [] },
  },
  companies: {
    companies: { type: "[Company!]!", selectableScalars: ["id", "name", "industry"] },
    company: { type: "Company", selectableScalars: ["id", "name", "industry"] },
    createCompany: { type: "Company!", selectableScalars: ["id", "name", "industry"] },
    updateCompany: { type: "Company!", selectableScalars: ["id", "name", "industry"] },
    deleteCompany: { type: "Boolean!", selectableScalars: [] },
  },
  stocks: {
    stocks: { type: "[Stock!]!", selectableScalars: ["id", "symbol", "price"] },
    stock: { type: "Stock", selectableScalars: ["id", "symbol", "price"] },
    createStock: { type: "Stock!", selectableScalars: ["id", "symbol", "price"] },
    updateStock: { type: "Stock!", selectableScalars: ["id", "symbol", "price"] },
    deleteStock: { type: "Boolean!", selectableScalars: [] },
  },
  events: {
    events: { type: "[Event!]!", selectableScalars: ["id", "name", "date"] },
    event: { type: "Event", selectableScalars: ["id", "name", "date"] },
    createEvent: { type: "Event!", selectableScalars: ["id", "name", "date"] },
    updateEvent: { type: "Event!", selectableScalars: ["id", "name", "date"] },
    deleteEvent: { type: "Boolean!", selectableScalars: [] },
  },
};

/**
 * Fields each entity's `/search` endpoint matches against, mirroring the
 * filters in apps/api/src/data/generators/*. Shown in the playground so users
 * know which fields a search term is compared to.
 */
export const SEARCH_FIELDS: Record<Entity, string[]> = {
  users: ["firstName", "lastName", "email", "username"],
  products: ["title", "description", "brand", "category"],
  posts: ["title", "body", "tags"],
  comments: ["body", "author", "email"],
  todos: ["todo"],
  carts: ["products.title"],
  messages: ["body"],
  notifications: ["title", "message"],
  quotes: ["content", "author", "category"],
  recipes: ["name", "description", "cuisine", "tags"],
  countries: ["name", "code", "capital", "currency"],
  companies: ["name", "industry", "description"],
  stocks: ["symbol", "name"],
  events: ["title", "description", "location", "organizer"],
};

/**
 * Resolve the entity name from a request path/URL, ignoring an optional
 * `/api/` prefix, sub-paths, and query string. Returns null when unknown.
 */
export function getEntityFromPath(path: string): Entity | null {
  const segment = path
    .replace(/^\/?(api\/)?/, "")
    .split(/[/?]/)[0]
    .toLowerCase();
  return (ENTITIES as readonly string[]).includes(segment) ? (segment as Entity) : null;
}

/**
 * Filter REST endpoints by query string (case-insensitive match on path and method).
 * Empty query returns all endpoints.
 */
export function filterEndpoints(query: string): RestEndpoint[] {
  if (!query.trim()) {
    return [...REST_ENDPOINTS];
  }

  const lowerQuery = query.toLowerCase();
  return REST_ENDPOINTS.filter(
    (endpoint) =>
      endpoint.path.toLowerCase().includes(lowerQuery) ||
      endpoint.method.toLowerCase().includes(lowerQuery),
  );
}
