import { generateNotifications } from "../../data/generators/notifications";
import { createEntityRouter } from "./entity-router";

export default createEntityRouter({
  entity: "notifications",
  generate: generateNotifications,
});
