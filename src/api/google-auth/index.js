import GoogleAuthHandler from "./handler.js";
import routes from "./routes.js";

const googleAuth = {
  name: "googleAuth",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const handler = new GoogleAuthHandler(service, tokenManager);
    server.route(routes(handler));
  },
};

export default googleAuth;
