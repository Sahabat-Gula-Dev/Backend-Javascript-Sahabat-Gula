import * as LogSchemas from "../../validator/logs/schema.js";

const routes = (handler) => [
  {
    method: "POST",
    path: "/log-foods",
    handler: handler.postFoodLogsHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Mencatat konsumsi makanan",
      tags: ["api", "logs"],
      validate: { payload: LogSchemas.FoodLogSchema },
    },
  },
  {
    method: "POST",
    path: "/log-activities",
    handler: handler.postActivityLogsHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Mencatat aktivitas",
      tags: ["api", "logs"],
      validate: { payload: LogSchemas.ActivityLogSchema },
    },
  },
  {
    method: "POST",
    path: "/log-steps",
    handler: handler.postStepLogsHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Mencatat langkah (step count)",
      tags: ["api", "logs"],
      validate: { payload: LogSchemas.StepLogSchema },
    },
  },
  {
    method: "POST",
    path: "/log-water",
    handler: handler.postWaterLogsHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Mencatat konsumsi air (ml)",
      tags: ["api", "logs"],
      validate: { payload: LogSchemas.WaterLogSchema },
    },
  },
];

export default routes;
