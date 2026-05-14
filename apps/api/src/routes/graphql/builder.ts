import SchemaBuilder from "@pothos/core";
import type {
  User,
  Product,
  Post,
  Comment,
  Todo,
  Cart,
  CartItem,
  Message,
  Notification,
  Quote,
  Recipe,
  RecipeIngredient,
  Country,
  Company,
  Stock,
  Event,
} from "@mockforge/types";

// Initialize the Pothos schema builder with TypeScript type safety
const builder = new SchemaBuilder<{
  Objects: {
    User: User;
    UserAddress: User["address"];
    Product: Product;
    Post: Post;
    Comment: Comment;
    Todo: Todo;
    CartItem: CartItem;
    Cart: Cart;
    Message: Message;
    Notification: Notification;
    Quote: Quote;
    Recipe: Recipe;
    RecipeIngredient: RecipeIngredient;
    Country: Country;
    Company: Company;
    Stock: Stock;
    Event: Event;
  };
}>({});

export default builder;
