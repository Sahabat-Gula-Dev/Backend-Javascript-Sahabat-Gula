import * as EventSchemas from "../../validator/events/schema.js";

const routes = (handler) => [
  {
    method: "GET",
    path: "/events",
    handler: handler.getEventsHandler,
    options: {
      description: "Menampilkan daftar event",
      tags: ["api", "events"],
      validate: { query: EventSchemas.EventQuerySchema },
    },
  },
  {
    method: "GET",
    path: "/events/{id}",
    handler: handler.getEventByIdHandler,
    options: {
      description: "Menampilkan event berdasarkan ID",
      tags: ["api", "events"],
    },
  },
  {
    method: "POST",
    path: "/events",
    handler: handler.postEventHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan event baru",
      tags: ["api", "events"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024,
      },
      validate: { payload: EventSchemas.EventCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/events/{id}",
    handler: handler.putEventHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui event",
      tags: ["api", "events"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024,
      },
      validate: { payload: EventSchemas.EventUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/events/{id}",
    handler: handler.deleteEventHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus event",
      tags: ["api", "events"],
    },
  },

  {
    method: "GET",
    path: "/event-categories",
    handler: handler.getCategoriesHandler,
    options: {
      description: "Menampilkan daftar kategori event",
      tags: ["api", "events"],
      validate: { query: EventSchemas.CategoryQuerySchema },
    },
  },
  {
    method: "POST",
    path: "/event-categories",
    handler: handler.postCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan kategori event",
      tags: ["api", "events"],
      validate: { payload: EventSchemas.CategoryCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/event-categories/{id}",
    handler: handler.putCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui kategori event",
      tags: ["api", "events"],
      validate: { payload: EventSchemas.CategoryUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/event-categories/{id}",
    handler: handler.deleteCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus kategori event",
      tags: ["api", "events"],
    },
  },
];

export default routes;
