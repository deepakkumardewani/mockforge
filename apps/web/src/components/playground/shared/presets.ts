/** Static demo catalogue — must match playground spec § Pre-seeded Demo Presets. */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RestPreset = {
  readonly id: string;
  readonly label: string;
  readonly method: HttpMethod;
  readonly url: string;
  readonly body?: string;
};

export type GraphqlPreset = {
  readonly id: string;
  readonly label: string;
  readonly query: string;
  /** JSON string when variables are needed */
  readonly variables?: string;
};

export type WsPreset = {
  readonly id: string;
  readonly label: string;
  readonly url: string;
};

export type WsMessagePreset = {
  readonly id: string;
  readonly label: string;
  readonly message: string;
};

export type SocketIoPreset = {
  readonly id: string;
  readonly label: string;
  readonly baseUrl: string;
  readonly namespace: string;
  readonly event: string;
};

export type SocketIoEmitPreset = {
  readonly id: string;
  readonly label: string;
  readonly event: string;
  /** JSON payload string; empty string means no payload */
  readonly payload: string;
};

export const REST_PRESETS: readonly RestPreset[] = [
  { id: "rest-users", label: "List users", method: "GET", url: "/api/users" },
  { id: "rest-user-one", label: "Single user", method: "GET", url: "/api/users/1" },
  {
    id: "rest-post",
    label: "Create post",
    method: "POST",
    url: "/api/posts",
    body: JSON.stringify({
      title: "Playground post",
      body: "Hello from MockForge playground",
      userId: 1,
    }),
  },
  {
    id: "rest-products",
    label: "Paginated products",
    method: "GET",
    url: "/api/products?limit=5",
  },
  { id: "rest-delete-todo", label: "Delete todo", method: "DELETE", url: "/api/todos/1" },
];

export const GRAPHQL_PRESETS: readonly GraphqlPreset[] = [
  {
    id: "gql-users",
    label: "Users (limit 5)",
    query: `query {
  users(limit: 5) {
    id
    firstName
    lastName
    email
  }
}`,
  },
  {
    id: "gql-product",
    label: "Product by id",
    query: `query Product($id: String!) {
  product(id: $id) {
    id
    title
    price
  }
}`,
    variables: JSON.stringify({ id: "1" }, null, 2),
  },
  {
    id: "gql-posts",
    label: "Recent posts",
    query: `query {
  posts(limit: 3) {
    id
    title
    body
  }
}`,
  },
  {
    id: "gql-create-post",
    label: "Create post",
    query: `mutation CreatePost($title: String!, $body: String) {
  createPost(title: $title, body: $body) {
    id
    title
    body
    userId
  }
}`,
    variables: JSON.stringify({ title: "Hi", body: "From GraphQL playground" }, null, 2),
  },
  {
    id: "gql-update-todo",
    label: "Update todo",
    query: `mutation UpdateTodo($id: String!, $completed: Boolean, $todo: String) {
  updateTodo(id: $id, completed: $completed, todo: $todo) {
    id
    todo
    completed
  }
}`,
    variables: JSON.stringify({ id: "1", completed: true, todo: "Done via GraphQL" }, null, 2),
  },
  {
    id: "gql-create-user",
    label: "Create user",
    query: `mutation {
  createUser(firstName: "Playground", email: "playground@mockforge.dev") {
    id
    firstName
    email
  }
}`,
  },
  {
    id: "gql-delete-stock",
    label: "Delete stock",
    query: `mutation {
  deleteStock(id: "demo-stock-1") {
    deleted
    id
  }
}`,
  },
];

export const WS_PRESETS: readonly WsPreset[] = [
  { id: "ws-stats", label: "Stats feed", url: "ws://localhost:4000/ws/stats" },
  { id: "ws-chat", label: "Chat", url: "ws://localhost:4000/ws/chat" },
  {
    id: "ws-notifications",
    label: "Notifications",
    url: "ws://localhost:4000/ws/notifications",
  },
  { id: "ws-ticker", label: "Ticker", url: "ws://localhost:4000/ws/ticker" },
];

/** Sample outbound payloads for the playground WS composer (fixed ticker endpoint). */
export const WS_MESSAGE_PRESETS: readonly WsMessagePreset[] = [
  { id: "ws-msg-ping", label: "Pong reply", message: "pong" },
  {
    id: "ws-msg-chat",
    label: "Chat JSON",
    message: JSON.stringify({ text: "Hello from playground", userId: 1 }),
  },
  { id: "ws-msg-type", label: "Typed ping", message: JSON.stringify({ type: "ping" }) },
];

export const WS_TICKER_ENDPOINT_INFO =
  "Streams live stock price updates every second (server-push; sent messages are ignored on this endpoint).";

export const SOCKETIO_PRESETS: readonly SocketIoPreset[] = [
  {
    id: "sio-chat",
    label: "Chat",
    baseUrl: "http://localhost:4001",
    namespace: "/chat",
    event: "message",
  },
  {
    id: "sio-notifications",
    label: "Notifications",
    baseUrl: "http://localhost:4001",
    namespace: "/notifications",
    event: "notify",
  },
  {
    id: "sio-ticker",
    label: "Ticker",
    baseUrl: "http://localhost:4001",
    namespace: "/ticker",
    event: "tick",
  },
];

/** Sample emit payloads for the Socket.IO composer. */
export const SOCKETIO_EMIT_PRESETS: readonly SocketIoEmitPreset[] = [
  {
    id: "sio-emit-chat",
    label: "Chat message",
    event: "message",
    payload: JSON.stringify({ text: "Hello from playground", userId: 1 }),
  },
  { id: "sio-emit-ping", label: "Ping", event: "ping", payload: "" },
  {
    id: "sio-emit-subscribe",
    label: "Subscribe",
    event: "subscribe",
    payload: JSON.stringify({ symbols: ["AAPL", "GOOG"] }),
  },
];

export const SOCKETIO_NAMESPACE_INFO: Readonly<Record<string, string>> = {
  "/ticker": "Emits tick events every second with live stock price updates (listen on tick).",
  "/chat": "Broadcasts chat messages in a room; emit message to post and receive auto-replies.",
  "/notifications":
    "Pushes notification events every few seconds after connect (listen on notification).",
};
