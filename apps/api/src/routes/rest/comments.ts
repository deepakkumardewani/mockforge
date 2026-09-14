import { generateComments } from "../../data/generators/comments";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "comments",
  generate: generateComments,
});
