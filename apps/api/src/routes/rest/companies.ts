import { generateCompanies } from "../../data/generators/companies";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "companies",
  generate: generateCompanies,
});
