import { generateUsers } from "../../data/generators/users";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "users",
  generate: generateUsers,
});
