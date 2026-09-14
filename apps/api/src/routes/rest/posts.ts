import { generatePosts } from "../../data/generators/posts";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "posts",
  generate: generatePosts,
});
