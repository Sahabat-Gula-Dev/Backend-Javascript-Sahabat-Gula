import * as PredictionSchemas from "../../validator/predictions/schema.js";

const routes = (handler) => [
  {
    method: "POST",
    path: "/predictions",
    handler: handler.postPredictionHandler,
    options: {
      description: "Upload image untuk prediksi makanan",
      tags: ["api", "predictions"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024, // 5MB
      },
      validate: { payload: PredictionSchemas.PredictionSchema },
    },
  },
];

export default routes;
