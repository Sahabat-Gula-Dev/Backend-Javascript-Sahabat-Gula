import * as ActivitySchemas from "../../validator/activities/schema.js";

const routes = (handler) => [
  {
    method: "GET",
    path: "/activities",
    handler: handler.getActivitiesHandler,
    options: {
      description:
        "Menampilkan daftar aktivitas dengan pagination, search, dan filter",
      tags: ["api", "activities"],
      validate: { query: ActivitySchemas.ActivityQuerySchema },
    },
  },
  {
    method: "GET",
    path: "/activities/{id}",
    handler: handler.getActivityByIdHandler,
    options: {
      description: "Menampilkan detail aktivitas berdasarkan ID",
      tags: ["api", "activities"],
    },
  },
  {
    method: "POST",
    path: "/activities",
    handler: handler.postActivityHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan aktivitas baru",
      tags: ["api", "activities"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024,
      },
      validate: { payload: ActivitySchemas.ActivityCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/activities/{id}",
    handler: handler.putActivityHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui aktivitas berdasarkan ID",
      tags: ["api", "activities"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024,
      },
      validate: { payload: ActivitySchemas.ActivityUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/activities/{id}",
    handler: handler.deleteActivityHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus aktivitas berdasarkan ID",
      tags: ["api", "activities"],
    },
  },

  {
    method: "GET",
    path: "/activity-categories",
    handler: handler.getCategoriesHandler,
    options: {
      description: "Menampilkan daftar kategori aktivitas",
      tags: ["api", "activities"],
      validate: { query: ActivitySchemas.CategoryQuerySchema },
    },
  },
  {
    method: "POST",
    path: "/activity-categories",
    handler: handler.postCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan kategori aktivitas baru",
      tags: ["api", "activities"],
      validate: { payload: ActivitySchemas.CategoryCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/activity-categories/{id}",
    handler: handler.putCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui kategori aktivitas",
      tags: ["api", "activities"],
      validate: { payload: ActivitySchemas.CategoryUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/activity-categories/{id}",
    handler: handler.deleteCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus kategori aktivitas",
      tags: ["api", "activities"],
    },
  },
];

export default routes;
