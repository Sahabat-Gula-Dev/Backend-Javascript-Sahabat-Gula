import routes from "./routes.js";
import LogsHandler from "./handler.js";

const logs = {
  name: "logs",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const logsHandler = new LogsHandler(service, tokenManager);
    server.route(routes(logsHandler));
  },
};

export default logs;
