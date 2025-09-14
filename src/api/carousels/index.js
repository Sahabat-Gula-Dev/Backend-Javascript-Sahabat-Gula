import routes from "./routes.js";
import CarouselsHandler from "./handler.js";

const carousels = {
  name: "carousels",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const carouselsHandler = new CarouselsHandler(service, tokenManager);
    server.route(routes(carouselsHandler));
  },
};

export default carousels;
