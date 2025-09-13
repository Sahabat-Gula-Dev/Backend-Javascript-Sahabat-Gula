import routes from "./routes.js";
import FoodsHandler from "./handler.js";

const foods = {
  name: "foods",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const foodsHandler = new FoodsHandler(service, tokenManager);
    server.route(routes(foodsHandler));
  },
};

export default foods;
