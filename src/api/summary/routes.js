const routes = (handler) => [
  {
    method: "GET",
    path: "/summary/today",
    handler: handler.getTodayHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Summary konsumsi hari ini",
      tags: ["api", "summary"],
    },
  },
  {
    method: "GET",
    path: "/summary/weekly",
    handler: handler.getWeeklyHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Summary 7 hari terakhir",
      tags: ["api", "summary"],
    },
  },
  {
    method: "GET",
    path: "/summary/monthly",
    handler: handler.getMonthlyHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Summary 7 bulan terakhir",
      tags: ["api", "summary"],
    },
  },
  {
    method: "GET",
    path: "/summary/history",
    handler: handler.getHistoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["user"] },
      description: "Summary history log (default 3 hari terakhir)",
      tags: ["api", "summary"],
    },
  },
];

export default routes;
