import routes from "./routes.js";
import AdminSummaryHandler from "./handler.js";

const adminSummary = {
  name: "admin-summary",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const adminSummaryHandler = new AdminSummaryHandler(service, tokenManager);
    server.route(routes(adminSummaryHandler));
  },
};

export default adminSummary;
