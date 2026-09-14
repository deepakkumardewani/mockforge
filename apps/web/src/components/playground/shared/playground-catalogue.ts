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

function singularEntity(entity: Entity): string {
  if (entity.endsWith("ies")) return `${entity.slice(0, -3)}y`;
  if (entity.endsWith("s")) return entity.slice(0, -1);
  return entity;
}

function crudEndpointsFor(entity: Entity): RestEndpoint[] {
  const singular = singularEntity(entity);
  return [
    { method: "GET", path: `/${entity}`, description: `List all ${entity}` },
    { method: "GET", path: `/${entity}/search`, description: `Search ${entity}` },
    { method: "GET", path: `/${entity}/:id`, description: `Get ${singular} by ID` },
    { method: "POST", path: `/${entity}`, description: `Create new ${singular}` },
    { method: "PUT", path: `/${entity}/:id`, description: `Update ${singular}` },
    { method: "DELETE", path: `/${entity}/:id`, description: `Delete ${singular}` },
  ];
}

/**
 * REST endpoints covering all catalogue entities × 6 CRUD patterns,
 * plus the explicit GET /stats probe.
 */
export const REST_ENDPOINTS: readonly RestEndpoint[] = [
  ...ENTITIES.flatMap(crudEndpointsFor),
  { method: "GET", path: "/stats", description: "Get system statistics" },
];

export interface GraphQLField {
  type: string;
  selectableScalars?: string[];
}

const DELETE_RESULT_FIELD = {
  type: "DeleteResult!",
  selectableScalars: ["deleted", "id"],
} satisfies GraphQLField;

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
    deleteUser: DELETE_RESULT_FIELD,
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
    deleteProduct: DELETE_RESULT_FIELD,
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
    deletePost: DELETE_RESULT_FIELD,
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
    deleteComment: DELETE_RESULT_FIELD,
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
    deleteTodo: DELETE_RESULT_FIELD,
  },
  carts: {
    carts: { type: "[Cart!]!", selectableScalars: ["id", "userId", "total"] },
    cart: { type: "Cart", selectableScalars: ["id", "userId", "total"] },
    createCart: { type: "Cart!", selectableScalars: ["id", "userId", "total"] },
    updateCart: { type: "Cart!", selectableScalars: ["id", "userId", "total"] },
    deleteCart: DELETE_RESULT_FIELD,
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
    deleteMessage: DELETE_RESULT_FIELD,
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
    deleteNotification: DELETE_RESULT_FIELD,
  },
  quotes: {
    quotes: { type: "[Quote!]!", selectableScalars: ["id", "author", "text"] },
    quote: { type: "Quote", selectableScalars: ["id", "author", "text"] },
    createQuote: { type: "Quote!", selectableScalars: ["id", "author", "text"] },
    updateQuote: { type: "Quote!", selectableScalars: ["id", "author", "text"] },
    deleteQuote: DELETE_RESULT_FIELD,
  },
  recipes: {
    recipes: { type: "[Recipe!]!", selectableScalars: ["id", "name", "ingredients"] },
    recipe: { type: "Recipe", selectableScalars: ["id", "name", "ingredients"] },
    createRecipe: { type: "Recipe!", selectableScalars: ["id", "name", "ingredients"] },
    updateRecipe: { type: "Recipe!", selectableScalars: ["id", "name", "ingredients"] },
    deleteRecipe: DELETE_RESULT_FIELD,
  },
  countries: {
    countries: { type: "[Country!]!", selectableScalars: ["id", "name", "code"] },
    country: { type: "Country", selectableScalars: ["id", "name", "code"] },
    createCountry: { type: "Country!", selectableScalars: ["id", "name", "code"] },
    updateCountry: { type: "Country!", selectableScalars: ["id", "name", "code"] },
    deleteCountry: DELETE_RESULT_FIELD,
  },
  companies: {
    companies: { type: "[Company!]!", selectableScalars: ["id", "name", "industry"] },
    company: { type: "Company", selectableScalars: ["id", "name", "industry"] },
    createCompany: { type: "Company!", selectableScalars: ["id", "name", "industry"] },
    updateCompany: { type: "Company!", selectableScalars: ["id", "name", "industry"] },
    deleteCompany: DELETE_RESULT_FIELD,
  },
  stocks: {
    stocks: { type: "[Stock!]!", selectableScalars: ["id", "symbol", "price"] },
    stock: { type: "Stock", selectableScalars: ["id", "symbol", "price"] },
    createStock: { type: "Stock!", selectableScalars: ["id", "symbol", "price"] },
    updateStock: { type: "Stock!", selectableScalars: ["id", "symbol", "price"] },
    deleteStock: DELETE_RESULT_FIELD,
  },
  events: {
    events: { type: "[Event!]!", selectableScalars: ["id", "name", "date"] },
    event: { type: "Event", selectableScalars: ["id", "name", "date"] },
    createEvent: { type: "Event!", selectableScalars: ["id", "name", "date"] },
    updateEvent: { type: "Event!", selectableScalars: ["id", "name", "date"] },
    deleteEvent: DELETE_RESULT_FIELD,
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
