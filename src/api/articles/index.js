import routes from "./routes.js";
import ArticlesHandler from "./handler.js";

const articles = {
  name: "articles",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const articlesHandler = new ArticlesHandler(service, tokenManager);
    server.route(routes(articlesHandler));
  },
};

export default articles;
