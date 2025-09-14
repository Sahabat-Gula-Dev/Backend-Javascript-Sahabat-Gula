import routes from "./routes.js";
import InformationsHandler from "./handler.js";

const informations = {
  name: "informations",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const informationsHandler = new InformationsHandler(service, tokenManager);
    server.route(routes(informationsHandler));
  },
};

export default informations;
