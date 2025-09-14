import * as ArticleSchemas from "../../validator/articles/schema.js";

const routes = (handler) => [
  {
    method: "GET",
    path: "/articles",
    handler: handler.getArticlesHandler,
    options: {
      description: "Menampilkan daftar artikel",
      tags: ["api", "articles"],
      validate: { query: ArticleSchemas.ArticleQuerySchema },
    },
  },
  {
    method: "GET",
    path: "/articles/{id}",
    handler: handler.getArticleByIdHandler,
    options: {
      description: "Menampilkan artikel berdasarkan ID",
      tags: ["api", "articles"],
    },
  },
  {
    method: "POST",
    path: "/articles",
    handler: handler.postArticleHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan artikel baru",
      tags: ["api", "articles"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024,
      },
      validate: { payload: ArticleSchemas.ArticleCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/articles/{id}",
    handler: handler.putArticleHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui artikel",
      tags: ["api", "articles"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024,
      },
      validate: { payload: ArticleSchemas.ArticleUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/articles/{id}",
    handler: handler.deleteArticleHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus artikel",
      tags: ["api", "articles"],
    },
  },

  // Categories
  {
    method: "GET",
    path: "/article-categories",
    handler: handler.getCategoriesHandler,
    options: {
      description: "Menampilkan daftar kategori artikel",
      tags: ["api", "articles"],
      validate: { query: ArticleSchemas.CategoryQuerySchema },
    },
  },
  {
    method: "POST",
    path: "/article-categories",
    handler: handler.postCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan kategori artikel",
      tags: ["api", "articles"],
      validate: { payload: ArticleSchemas.CategoryCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/article-categories/{id}",
    handler: handler.putCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui kategori artikel",
      tags: ["api", "articles"],
      validate: { payload: ArticleSchemas.CategoryUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/article-categories/{id}",
    handler: handler.deleteCategoryHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus kategori artikel",
      tags: ["api", "articles"],
    },
  },
];

export default routes;
