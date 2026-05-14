import { describe, it, expect } from "vitest";
import { generateUsers } from "./users";
import { generateProducts } from "./products";
import { generatePosts } from "./posts";
import { generateComments } from "./comments";
import { generateTodos } from "./todos";
import { generateCarts } from "./carts";
import { generateMessages } from "./messages";
import { generateNotifications } from "./notifications";
import { generateQuotes } from "./quotes";
import { generateRecipes } from "./recipes";
import { generateCountries } from "./countries";
import { generateCompanies } from "./companies";
import { generateStocks } from "./stocks";
import { generateEvents } from "./events";

describe("Tier 1 Generators", () => {
  describe("generateUsers", () => {
    it("should return exactly limit items", () => {
      const result = generateUsers({ limit: 5, skip: 0, order: "asc" });
      expect(result).toHaveLength(5);
    });

    it("should apply search filter", () => {
      const result = generateUsers({ limit: 10, skip: 0, search: "a", order: "asc" });
      expect(Array.isArray(result)).toBe(true);
      // All results should have 'a' in firstName, lastName, email, or username
      result.forEach((user) => {
        const hasSearchTerm =
          user.firstName.toLowerCase().includes("a") ||
          user.lastName.toLowerCase().includes("a") ||
          user.email.toLowerCase().includes("a") ||
          user.username.toLowerCase().includes("a");
        expect(hasSearchTerm).toBe(true);
      });
    });

    it("should return empty array if search matches nothing", () => {
      const result = generateUsers({
        limit: 10,
        skip: 0,
        search: "xyzunique12345notfound",
        order: "asc",
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should have valid user structure", () => {
      const result = generateUsers({ limit: 1, skip: 0, order: "asc" });
      const user = result[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("firstName");
      expect(user).toHaveProperty("lastName");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("phone");
      expect(user).toHaveProperty("avatar");
      expect(user).toHaveProperty("address");
      expect(user.address).toHaveProperty("street");
      expect(user.address).toHaveProperty("city");
      expect(user.address).toHaveProperty("state");
      expect(user.address).toHaveProperty("zipCode");
      expect(user.address).toHaveProperty("country");
    });
  });

  describe("generateProducts", () => {
    it("should return exactly limit items", () => {
      const result = generateProducts({ limit: 5, skip: 0, order: "asc" });
      expect(result).toHaveLength(5);
    });

    it("should apply search filter", () => {
      const result = generateProducts({ limit: 10, skip: 0, search: "a", order: "asc" });
      expect(Array.isArray(result)).toBe(true);
      result.forEach((product) => {
        const hasSearchTerm =
          product.title.toLowerCase().includes("a") ||
          product.description.toLowerCase().includes("a") ||
          product.brand.toLowerCase().includes("a") ||
          product.category.toLowerCase().includes("a");
        expect(hasSearchTerm).toBe(true);
      });
    });

    it("should have valid product structure", () => {
      const result = generateProducts({ limit: 1, skip: 0, order: "asc" });
      const product = result[0];
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("title");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("category");
      expect(product).toHaveProperty("rating");
      expect(typeof product.price).toBe("number");
      expect(typeof product.rating).toBe("number");
    });
  });

  describe("generatePosts", () => {
    it("should return exactly limit items", () => {
      const result = generatePosts({ limit: 5, skip: 0, order: "asc" });
      expect(result).toHaveLength(5);
    });

    it("should apply search filter", () => {
      const result = generatePosts({ limit: 10, skip: 0, search: "a", order: "asc" });
      expect(Array.isArray(result)).toBe(true);
      result.forEach((post) => {
        const hasSearchTerm =
          post.title.toLowerCase().includes("a") ||
          post.body.toLowerCase().includes("a") ||
          post.tags.some((t) => t.toLowerCase().includes("a"));
        expect(hasSearchTerm).toBe(true);
      });
    });

    it("should have valid post structure", () => {
      const result = generatePosts({ limit: 1, skip: 0, order: "asc" });
      const post = result[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("body");
      expect(post).toHaveProperty("userId");
      expect(post).toHaveProperty("tags");
      expect(Array.isArray(post.tags)).toBe(true);
    });
  });

  describe("generateComments", () => {
    it("should return exactly limit items", () => {
      const result = generateComments({ limit: 5, skip: 0, order: "asc" });
      expect(result).toHaveLength(5);
    });

    it("should apply search filter", () => {
      const result = generateComments({ limit: 10, skip: 0, search: "a", order: "asc" });
      expect(Array.isArray(result)).toBe(true);
      result.forEach((comment) => {
        const hasSearchTerm =
          comment.body.toLowerCase().includes("a") ||
          comment.author.toLowerCase().includes("a") ||
          comment.email.toLowerCase().includes("a");
        expect(hasSearchTerm).toBe(true);
      });
    });

    it("should have valid comment structure", () => {
      const result = generateComments({ limit: 1, skip: 0, order: "asc" });
      const comment = result[0];
      expect(comment).toHaveProperty("id");
      expect(comment).toHaveProperty("postId");
      expect(comment).toHaveProperty("userId");
      expect(comment).toHaveProperty("body");
      expect(comment).toHaveProperty("author");
      expect(comment).toHaveProperty("email");
    });
  });

  describe("generateTodos", () => {
    it("should return exactly limit items", () => {
      const result = generateTodos({ limit: 5, skip: 0, order: "asc" });
      expect(result).toHaveLength(5);
    });

    it("should apply search filter", () => {
      const result = generateTodos({ limit: 10, skip: 0, search: "a", order: "asc" });
      expect(Array.isArray(result)).toBe(true);
      result.forEach((todo) => {
        expect(todo.todo.toLowerCase().includes("a")).toBe(true);
      });
    });

    it("should have valid todo structure", () => {
      const result = generateTodos({ limit: 1, skip: 0, order: "asc" });
      const todo = result[0];
      expect(todo).toHaveProperty("id");
      expect(todo).toHaveProperty("userId");
      expect(todo).toHaveProperty("todo");
      expect(todo).toHaveProperty("completed");
      expect(todo).toHaveProperty("priority");
      expect(["low", "medium", "high"]).toContain(todo.priority);
    });
  });

  describe("generateCarts", () => {
    it("should return exactly limit items", () => {
      const result = generateCarts({ limit: 5, skip: 0, order: "asc" });
      expect(result).toHaveLength(5);
    });

    it("should apply search filter", () => {
      const result = generateCarts({ limit: 10, skip: 0, search: "a", order: "asc" });
      expect(Array.isArray(result)).toBe(true);
      result.forEach((cart) => {
        const hasSearchTerm = cart.products.some((p) => p.title.toLowerCase().includes("a"));
        expect(hasSearchTerm).toBe(true);
      });
    });

    it("should have valid cart structure", () => {
      const result = generateCarts({ limit: 1, skip: 0, order: "asc" });
      const cart = result[0];
      expect(cart).toHaveProperty("id");
      expect(cart).toHaveProperty("userId");
      expect(cart).toHaveProperty("products");
      expect(cart).toHaveProperty("total");
      expect(cart).toHaveProperty("totalProducts");
      expect(cart).toHaveProperty("totalQuantity");
      expect(Array.isArray(cart.products)).toBe(true);
      expect(cart.products.length).toBeGreaterThan(0);
    });
  });

  describe("Tier 2 Generators", () => {
    describe("generateMessages", () => {
      it("should return exactly limit items", () => {
        const result = generateMessages({ limit: 5, skip: 0, order: "asc" });
        expect(result).toHaveLength(5);
      });

      it("should have valid message structure", () => {
        const result = generateMessages({ limit: 1, skip: 0, order: "asc" });
        const message = result[0];
        expect(message).toHaveProperty("id");
        expect(message).toHaveProperty("senderId");
        expect(message).toHaveProperty("receiverId");
        expect(message).toHaveProperty("body");
        expect(message).toHaveProperty("read");
      });
    });

    describe("generateNotifications", () => {
      it("should return exactly limit items", () => {
        const result = generateNotifications({ limit: 5, skip: 0, order: "asc" });
        expect(result).toHaveLength(5);
      });

      it("should have valid notification structure", () => {
        const result = generateNotifications({ limit: 1, skip: 0, order: "asc" });
        const notification = result[0];
        expect(notification).toHaveProperty("id");
        expect(notification).toHaveProperty("userId");
        expect(notification).toHaveProperty("title");
        expect(notification).toHaveProperty("message");
        expect(notification).toHaveProperty("type");
        expect(["info", "warning", "success", "error"]).toContain(notification.type);
      });
    });

    describe("generateQuotes", () => {
      it("should return exactly limit items", () => {
        const result = generateQuotes({ limit: 5, skip: 0, order: "asc" });
        expect(result).toHaveLength(5);
      });

      it("should have valid quote structure", () => {
        const result = generateQuotes({ limit: 1, skip: 0, order: "asc" });
        const quote = result[0];
        expect(quote).toHaveProperty("id");
        expect(quote).toHaveProperty("content");
        expect(quote).toHaveProperty("author");
        expect(quote).toHaveProperty("category");
        expect(quote).toHaveProperty("likes");
      });
    });

    describe("generateRecipes", () => {
      it("should return exactly limit items", () => {
        const result = generateRecipes({ limit: 5, skip: 0, order: "asc" });
        expect(result).toHaveLength(5);
      });

      it("should have valid recipe structure", () => {
        const result = generateRecipes({ limit: 1, skip: 0, order: "asc" });
        const recipe = result[0];
        expect(recipe).toHaveProperty("id");
        expect(recipe).toHaveProperty("name");
        expect(recipe).toHaveProperty("ingredients");
        expect(recipe).toHaveProperty("instructions");
        expect(recipe).toHaveProperty("difficulty");
        expect(["easy", "medium", "hard"]).toContain(recipe.difficulty);
        expect(Array.isArray(recipe.ingredients)).toBe(true);
        expect(Array.isArray(recipe.instructions)).toBe(true);
      });
    });

    describe("generateCountries", () => {
      it("should return exactly limit items", () => {
        const result = generateCountries({ limit: 5, skip: 0, order: "asc" });
        expect(result).toHaveLength(5);
      });

      it("should have valid country structure", () => {
        const result = generateCountries({ limit: 1, skip: 0, order: "asc" });
        const country = result[0];
        expect(country).toHaveProperty("id");
        expect(country).toHaveProperty("name");
        expect(country).toHaveProperty("code");
        expect(country).toHaveProperty("capital");
        expect(country).toHaveProperty("population");
        expect(country).toHaveProperty("currency");
      });
    });

    describe("generateCompanies", () => {
      it("should return exactly limit items", () => {
        const result = generateCompanies({ limit: 5, skip: 0, order: "asc" });
        expect(result).toHaveLength(5);
      });

      it("should have valid company structure", () => {
        const result = generateCompanies({ limit: 1, skip: 0, order: "asc" });
        const company = result[0];
        expect(company).toHaveProperty("id");
        expect(company).toHaveProperty("name");
        expect(company).toHaveProperty("industry");
        expect(company).toHaveProperty("website");
        expect(company).toHaveProperty("foundedYear");
        expect(company).toHaveProperty("employees");
      });
    });

    describe("generateStocks", () => {
      it("should return exactly limit items", () => {
        const result = generateStocks({ limit: 5, skip: 0, order: "asc" });
        expect(result).toHaveLength(5);
      });

      it("should have valid stock structure", () => {
        const result = generateStocks({ limit: 1, skip: 0, order: "asc" });
        const stock = result[0];
        expect(stock).toHaveProperty("id");
        expect(stock).toHaveProperty("symbol");
        expect(stock).toHaveProperty("name");
        expect(stock).toHaveProperty("price");
        expect(stock).toHaveProperty("change");
        expect(stock).toHaveProperty("volume");
        expect(stock).toHaveProperty("marketCap");
        expect(typeof stock.price).toBe("number");
        expect(typeof stock.volume).toBe("number");
        expect(typeof stock.marketCap).toBe("number");
      });
    });

    describe("generateEvents", () => {
      it("should return exactly limit items", () => {
        const result = generateEvents({ limit: 5, skip: 0, order: "asc" });
        expect(result).toHaveLength(5);
      });

      it("should have valid event structure", () => {
        const result = generateEvents({ limit: 1, skip: 0, order: "asc" });
        const event = result[0];
        expect(event).toHaveProperty("id");
        expect(event).toHaveProperty("title");
        expect(event).toHaveProperty("description");
        expect(event).toHaveProperty("category");
        expect(event).toHaveProperty("location");
        expect(event).toHaveProperty("startDate");
        expect(event).toHaveProperty("endDate");
        expect(event).toHaveProperty("organizer");
        expect(event).toHaveProperty("price");
        expect(event).toHaveProperty("isFree");
      });
    });
  });
});
