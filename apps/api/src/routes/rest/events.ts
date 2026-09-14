import { generateEvents } from "../../data/generators/events";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "events",
  generate: generateEvents,
});
