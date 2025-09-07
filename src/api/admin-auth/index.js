import AdminAuthHandler from "./handler.js";
import routes from "./routes.js";

const adminAuth = {
  name: "adminAuth",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const handler = new AdminAuthHandler(service, tokenManager);
    server.route(routes(handler));
  },
};

export default adminAuth;
