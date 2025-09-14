import routes from "./routes.js";
import TipsHandler from "./handler.js";

const tips = {
  name: "tips",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const tipsHandler = new TipsHandler(service, tokenManager);
    server.route(routes(tipsHandler));
  },
};

export default tips;
