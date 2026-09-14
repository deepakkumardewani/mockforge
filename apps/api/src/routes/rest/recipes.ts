import { generateRecipes } from "../../data/generators/recipes";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "recipes",
  generate: generateRecipes,
});
