import * as FoodSchemas from "../../validator/foods/schema.js";

const routes = (handler) => [
  // -------- FOODS (public-read: user/admin/super-admin) --------
  {
    method: "GET",
    path: "/foods",
    handler: handler.getFoodsHandler,
    options: {
      description: "List & search foods",
      tags: ["api", "foods"],
      validate: { query: FoodSchemas.FoodQuerySchema },
    },
  },
  {
    method: "GET",
    path: "/foods/{id}",
    handler: handler.getFoodByIdHandler,
    options: {
      description: "Get food by id",
      tags: ["api", "foods"],
    },
  },

  // -------- FOODS (write: admin & super-admin) --------
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
        "Create food (auto-create category if category_name provided)",
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
      description: "Update food",
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
      description: "Delete food",
      tags: ["api", "foods"],
    },
  },

  // -------- CATEGORIES --------
  {
    method: "GET",
    path: "/food-categories",
    handler: handler.getCategoriesHandler,
    options: {
      description: "List categories",
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
      description: "Create category",
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
      description: "Update category",
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
      description: "Delete category",
      tags: ["api", "foods"],
    },
  },
];

export default routes;
