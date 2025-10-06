const routes = (handler) => [
  {
    method: "GET",
    path: "/admin-summary",
    handler: handler.getAdminDashboardHandler,
    options: {
      auth: { strategy: "jwt", scope: ["admin", "super-admin"] },
      description: "Admin dashboard summary data",
      tags: ["api", "admin-summary"],
    },
  },
];
export default routes;
