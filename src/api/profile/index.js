import Profile from "./handler.js";
import routes from "./routes.js";

const profile = {
  name: "profile",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const handler = new Profile(service, tokenManager);
    server.route(routes(handler));
  },
};

export default profile;
