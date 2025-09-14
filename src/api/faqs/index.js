import routes from "./routes.js";
import FaqsHandler from "./handler.js";

const faqs = {
  name: "faqs",
  version: "1.0.0",
  register: async (server, { service, tokenManager }) => {
    const faqsHandler = new FaqsHandler(service, tokenManager);
    server.route(routes(faqsHandler));
  },
};

export default faqs;
