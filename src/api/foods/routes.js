import * as FoodSchemas from "../../validator/foods/schema.js";

const routes = (handler) => [
  {
    method: "GET",
    path: "/foods",
    handler: handler.getFoodsHandler,
    options: {
      description: "Menampilkan daftar makanan dengan pagination, search, dan filter",
      tags: ["api", "foods"],
      validate: { query: FoodSchemas.FoodQuerySchema },
    },
  },
  {
    method: "GET",
    path: "/foods/{id}",
    handler: handler.getFoodByIdHandler,
    options: {
      description: "Menampilkan makanan berdasarkan ID",
      tags: ["api", "foods"],
    },
  },

  {
    method: "POST",
    path: "/foods",
    handler: handler.postFoodHandler,
    options: {
      auth: {
        strategy: "jwt",
        scope: ["super-admin", "admin"],
      },
      description:
        "Menambahkan makanan baru. Gambar makanan diunggah sebagai file multipart/form-data dengan field 'image'",
      tags: ["api", "foods"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024, // 5MB
      },
      validate: { payload: FoodSchemas.FoodCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/foods/{id}",
    handler: handler.putFoodHandler,
    options: {
      auth: {
        strategy: "jwt",
        scope: ["super-admin", "admin"],
      },
      description: "Memperbarui data makanan berdasarkan ID. Gambar makanan diunggah sebagai file multipart/form-data dengan field 'image'",
      tags: ["api", "foods"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024, // 5MB
      },
      validate: { payload: FoodSchemas.FoodUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/foods/{id}",
    handler: handler.deleteFoodHandler,
    options: {
      auth: {
        strategy: "jwt",
        scope: ["super-admin", "admin"],
      },
      description: "Menghapus makanan berdasarkan ID",
      tags: ["api", "foods"],
    },
  },

  {
    method: "GET",
    path: "/food-categories",
    handler: handler.getCategoriesHandler,
    options: {
      description: "Menampilkan daftar kategori makanan",
      tags: ["api", "foods"],
      validate: { query: FoodSchemas.CategoryQuerySchema },
    },
  },
  {
    method: "POST",
    path: "/food-categories",
    handler: handler.postCategoryHandler,
    options: {
      auth: {
        strategy: "jwt",
        scope: ["super-admin", "admin"],
      },
      description: "Menambahkan kategori makanan baru",
      tags: ["api", "foods"],
      validate: { payload: FoodSchemas.CategoryCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/food-categories/{id}",
    handler: handler.putCategoryHandler,
    options: {
      auth: {
        strategy: "jwt",
        scope: ["super-admin", "admin"],
      },
      description: "Memperbarui kategori makanan berdasarkan ID",
      tags: ["api", "foods"],
      validate: { payload: FoodSchemas.CategoryUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/food-categories/{id}",
    handler: handler.deleteCategoryHandler,
    options: {
      auth: {
        strategy: "jwt",
        scope: ["super-admin", "admin"],
      },
      description: "Menghapus kategori makanan berdasarkan ID",
      tags: ["api", "foods"],
    },
  },
];

export default routes;
