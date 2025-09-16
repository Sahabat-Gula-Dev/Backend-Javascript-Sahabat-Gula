import routes from "./routes.js";
import SummaryHandler from "./handler.js";

const summary = {
  name: "summary",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const summaryHandler = new SummaryHandler(service, tokenManager);
    server.route(routes(summaryHandler));
  },
};

export default summary;
