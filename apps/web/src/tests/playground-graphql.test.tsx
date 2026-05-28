import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, renderHook, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GraphqlPanel } from "@/components/playground/graphql/GraphqlPanel";
import { sendGraphqlFetch, useGraphqlRequest } from "@/hooks/use-graphql-request";

vi.mock("@/hooks/use-mf-id", () => ({
  useMfId: () => null,
}));

function makeQueryWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("Playground GraphQL — GraphqlPanel", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("preset populates query and variables without calling fetch until Send", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { users: [] } }), {
        status: 200,
        statusText: "OK",
      }),
    );

    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <GraphqlPanel />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("textbox", { name: "GraphQL endpoint URL" })).toHaveValue(
      "http://localhost:4000/graphql",
    );

    await user.click(screen.getByRole("button", { name: "Product by id" }));

    expect(screen.getByRole("textbox", { name: "GraphQL query" })).toHaveValue(
      `query Product($id: String!) {
  product(id: $id) {
    id
    title
    price
  }
}`,
    );
    expect(screen.getByRole("textbox", { name: "GraphQL variables JSON" })).toHaveValue(
      JSON.stringify({ id: "1" }, null, 2),
    );
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1));
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url as string).toMatch(/\/graphql$/u);
    expect(init?.method).toBe("POST");
    const body = JSON.parse(init?.body as string);
    expect(body.query).toContain("product");
    expect(body.variables).toEqual({ id: "1" });
    expect(await screen.findByText("200")).toBeInTheDocument();
  });

  it("omits variables key when variables editor is empty", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { users: [] } }), { status: 200, statusText: "OK" }),
    );

    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <GraphqlPanel />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Users (limit 5)" }));
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse(init?.body as string);
    expect(body).toHaveProperty("query");
    expect(body).not.toHaveProperty("variables");
  });

  it("disables Send when variables JSON is invalid", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <GraphqlPanel />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Product by id" }));
    const vars = screen.getByRole("textbox", { name: "GraphQL variables JSON" });
    fireEvent.change(vars, { target: { value: "{not-json" } });

    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("toggles schema sidebar open and closed", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <GraphqlPanel />
      </QueryClientProvider>,
    );

    expect(screen.queryByLabelText("GraphQL schema")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Toggle schema sidebar" }));
    expect(screen.getByLabelText("GraphQL schema")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Toggle schema sidebar" }));
    expect(screen.queryByLabelText("GraphQL schema")).not.toBeInTheDocument();
  });

  it("persists schema sidebar state to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <GraphqlPanel />
      </QueryClientProvider>,
    );

    expect(localStorage.getItem("mf_schema_sidebar_open")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Toggle schema sidebar" }));
    expect(localStorage.getItem("mf_schema_sidebar_open")).toBe("true");

    await user.click(screen.getByRole("button", { name: "Toggle schema sidebar" }));
    expect(localStorage.getItem("mf_schema_sidebar_open")).toBe("false");
  });

  it("clicking a schema field replaces existing unrelated query content", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <GraphqlPanel />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "GraphQL query" }), {
      target: { value: "query { __typename }" },
    });
    await user.click(screen.getByRole("button", { name: "Toggle schema sidebar" }));
    await user.click(screen.getByRole("button", { name: /^users/u }));

    const queryEditor = screen.getByRole("textbox", {
      name: "GraphQL query",
    }) as HTMLTextAreaElement;
    expect(queryEditor.value).not.toContain("__typename");
    expect(queryEditor.value).toContain("users {");
    expect(queryEditor.value).toContain("firstName");
    expect(queryEditor.value.match(/^query \{/gm)?.length).toBe(1);
  });

  it("clicking a different schema field replaces the previous query", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <GraphqlPanel />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Toggle schema sidebar" }));
    await user.click(screen.getByRole("button", { name: /^users/u }));

    const queryEditor = screen.getByRole("textbox", {
      name: "GraphQL query",
    }) as HTMLTextAreaElement;
    expect(queryEditor.value).toContain("users {");

    await user.click(screen.getByRole("button", { name: /^products/u }));
    expect(queryEditor.value).not.toContain("users");
    expect(queryEditor.value).toContain("products {");
    expect(queryEditor.value.match(/^query \{/gm)?.length).toBe(1);
  });

  it("renders GraphQL errors payload in the response body", async () => {
    const user = userEvent.setup();
    const gqlResponse = {
      data: null,
      errors: [{ message: "Variable `$id` was not provided." }],
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(gqlResponse), { status: 200, statusText: "OK" }),
    );

    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <GraphqlPanel />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Users (limit 5)" }));
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("200")).toBeInTheDocument();
    expect(await screen.findByText(/\$id.*not provided/u)).toBeInTheDocument();
  });
});

describe("Playground GraphQL — useGraphqlRequest", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns status and parsed JSON body on HTTP 200", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        statusText: "OK",
      }),
    );

    const { result } = renderHook(() => useGraphqlRequest(null), {
      wrapper: makeQueryWrapper(),
    });

    await act(async () => {
      await result.current.send({
        query: "{ __typename }",
        variablesJson: "",
      });
    });

    await waitFor(() => {
      expect(result.current.response?.status).toBe(200);
    });
    expect(result.current.response?.body).toEqual({ data: { ok: true } });
    expect(result.current.error).toBeNull();
  });

  it("sendGraphqlFetch records non-2xx without throwing", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("Bad Request", { status: 400, statusText: "Bad Request" }),
    );

    const res = await sendGraphqlFetch({ query: "{}", variablesJson: "" }, null);
    expect(res.status).toBe(400);
    expect(res.body).toBe("Bad Request");
  });
});
