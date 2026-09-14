import { generateTodos } from "../../data/generators/todos";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "todos",
  generate: generateTodos,
});
