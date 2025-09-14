import routes from "./routes.js";
import ActivitiesHandler from "./handler.js";

const activities = {
  name: "activities",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const activitiesHandler = new ActivitiesHandler(service, tokenManager);
    server.route(routes(activitiesHandler));
  },
};

export default activities;
