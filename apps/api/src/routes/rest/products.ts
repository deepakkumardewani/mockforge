import { generateProducts } from "../../data/generators/products";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "products",
  generate: generateProducts,
});
