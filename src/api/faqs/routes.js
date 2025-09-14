import * as FaqSchemas from "../../validator/faqs/schema.js";

const routes = (handler) => [
  {
    method: "GET",
    path: "/faqs",
    handler: handler.getFaqsHandler,
    options: {
      description: "Menampilkan daftar FAQ",
      tags: ["api", "faqs"],
      validate: { query: FaqSchemas.FaqQuerySchema },
    },
  },
  {
    method: "GET",
    path: "/faqs/{id}",
    handler: handler.getFaqByIdHandler,
    options: {
      description: "Menampilkan FAQ berdasarkan ID",
      tags: ["api", "faqs"],
    },
  },
  {
    method: "POST",
    path: "/faqs",
    handler: handler.postFaqHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan FAQ baru",
      tags: ["api", "faqs"],
      validate: { payload: FaqSchemas.FaqCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/faqs/{id}",
    handler: handler.putFaqHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui FAQ",
      tags: ["api", "faqs"],
      validate: { payload: FaqSchemas.FaqUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/faqs/{id}",
    handler: handler.deleteFaqHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus FAQ",
      tags: ["api", "faqs"],
    },
  },

  // Categories
  {
    method: "GET",
    path: "/faq-categories",
    handler: handler.getCategoriesHandler,
    options: {
      description: "Menampilkan daftar kategori FAQ",
      tags: ["api", "faqs"],
      validate: { query: FaqSchemas.CategoryQuerySchema },
    },
  },
  {
    method: "POST",
    path: "/faq-categories",
    handler: handler.postCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan kategori FAQ",
      tags: ["api", "faqs"],
      validate: { payload: FaqSchemas.CategoryCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/faq-categories/{id}",
    handler: handler.putCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui kategori FAQ",
      tags: ["api", "faqs"],
      validate: { payload: FaqSchemas.CategoryUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/faq-categories/{id}",
    handler: handler.deleteCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus kategori FAQ",
      tags: ["api", "faqs"],
    },
  },
];

export default routes;
