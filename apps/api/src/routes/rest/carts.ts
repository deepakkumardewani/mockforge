import { generateCarts } from "../../data/generators/carts";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "carts",
  generate: generateCarts,
});
