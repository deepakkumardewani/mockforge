import { generateCountries } from "../../data/generators/countries";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "countries",
  generate: generateCountries,
});
