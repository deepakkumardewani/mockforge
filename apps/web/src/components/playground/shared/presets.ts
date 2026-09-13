import { playgroundWsUrl } from "@/components/playground/ws/playground-ws-url";
import { getSocketIoBaseUrl } from "@/lib/playground-env";

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
  readonly description: string;
  readonly url: string;
  readonly acceptsOutbound: boolean;
};

export type WsMessagePreset = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly forEndpointIds: readonly string[];
  readonly message: string;
};

export type SocketIoPreset = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly baseUrl: string;
  readonly namespace: string;
  readonly event: string;
  readonly acceptsOutbound: boolean;
};

export type SocketIoEmitPreset = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly forEndpointIds: readonly string[];
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
  {
    id: "ws-stats",
    label: "Stats feed",
    description: "Live counters. After ~30s the server pings; send pong or it disconnects.",
    url: playgroundWsUrl("/ws/stats"),
    acceptsOutbound: true,
  },
  {
    id: "ws-chat",
    label: "Chat",
    description:
      "Connect, then send a chat payload from Message. Server also posts random room messages.",
    url: playgroundWsUrl("/ws/chat/playground"),
    acceptsOutbound: true,
  },
  {
    id: "ws-notifications",
    label: "Notifications",
    description: "Server pushes a new alert about every 2s. Outbound messages are ignored.",
    url: playgroundWsUrl("/ws/notifications"),
    acceptsOutbound: false,
  },
  {
    id: "ws-ticker",
    label: "Ticker",
    description: "Stock ticks every second. Outbound messages are ignored.",
    url: playgroundWsUrl("/ws/ticker"),
    acceptsOutbound: false,
  },
];

/** Sample outbound payloads for the playground WS composer. */
export const WS_MESSAGE_PRESETS: readonly WsMessagePreset[] = [
  {
    id: "ws-msg-ping",
    label: "Pong reply",
    description: "Sends the text pong (keeps the stats socket alive).",
    forEndpointIds: ["ws-stats"],
    message: "pong",
  },
  {
    id: "ws-msg-chat",
    label: "Chat JSON",
    description: "Posts a chat message to the room.",
    forEndpointIds: ["ws-chat"],
    message: JSON.stringify({ text: "Hello from playground", userId: 1 }),
  },
];

export const SOCKETIO_PRESETS: readonly SocketIoPreset[] = [
  {
    id: "sio-chat",
    label: "Chat",
    description: "Connect, then emit a chat message. Server also posts room messages.",
    baseUrl: getSocketIoBaseUrl(),
    namespace: "/chat",
    event: "message",
    acceptsOutbound: true,
  },
  {
    id: "sio-notifications",
    label: "Notifications",
    description: "Server pushes a new alert about every 2s. Outbound emits are ignored.",
    baseUrl: getSocketIoBaseUrl(),
    namespace: "/notifications",
    event: "notification",
    acceptsOutbound: false,
  },
  {
    id: "sio-ticker",
    label: "Ticker",
    description: "Stock ticks every second. Outbound emits are ignored.",
    baseUrl: getSocketIoBaseUrl(),
    namespace: "/ticker",
    event: "tick",
    acceptsOutbound: false,
  },
];

/** Sample emit payloads for the Socket.IO composer. */
export const SOCKETIO_EMIT_PRESETS: readonly SocketIoEmitPreset[] = [
  {
    id: "sio-emit-chat",
    label: "Chat message",
    description: "Emits message with text + userId.",
    forEndpointIds: ["sio-chat"],
    event: "message",
    payload: JSON.stringify({ text: "Hello from playground", userId: 1 }),
  },
];
