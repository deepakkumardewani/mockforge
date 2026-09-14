import { generateQuotes } from "../../data/generators/quotes";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "quotes",
  generate: generateQuotes,
});
