import routes from "./routes.js";
import EventsHandler from "./handler.js";

const events = {
  name: "events",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const eventsHandler = new EventsHandler(service, tokenManager);
    server.route(routes(eventsHandler));
  },
};

export default events;
