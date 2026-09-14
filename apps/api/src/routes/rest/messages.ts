import { generateMessages } from "../../data/generators/messages";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "messages",
  generate: generateMessages,
});
