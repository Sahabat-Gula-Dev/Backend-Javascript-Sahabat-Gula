import routes from "./routes.js";
import PredictionsHandler from "./handler.js";

const predictions = {
  name: "predictions",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const predictionsHandler = new PredictionsHandler(service, tokenManager);
    server.route(routes(predictionsHandler));
  },
};

export default predictions;
