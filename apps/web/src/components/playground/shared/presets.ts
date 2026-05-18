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

export type SocketIoPreset = {
  readonly id: string;
  readonly label: string;
  readonly baseUrl: string;
  readonly namespace: string;
  readonly event: string;
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
    query: "query { users(limit: 5) { id name email } }",
  },
  {
    id: "gql-product",
    label: "Product by id",
    query: "query Product($id: ID!) { product(id: $id) { id title price } }",
    variables: JSON.stringify({ id: "1" }),
  },
  {
    id: "gql-create-post",
    label: "Create post",
    query:
      'mutation { createPost(input: { title: "Hi" }) { id title } }',
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
