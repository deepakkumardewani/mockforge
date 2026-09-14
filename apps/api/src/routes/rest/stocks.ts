import { generateStocks } from "../../data/generators/stocks";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "stocks",
  generate: generateStocks,
});
