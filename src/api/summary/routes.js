const routes = (handler) => [
  {
    method: "GET",
    path: "/summary",
    handler: handler.getAllSummaryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Summary daily, weekly, monthly",
      tags: ["api", "summary"],
    },
  },
  {
    method: "GET",
    path: "/history-log",
    handler: handler.getHistoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Summary history log (default 3 hari terakhir)",
      tags: ["api", "summary"],
    },
  },
];

export default routes;
