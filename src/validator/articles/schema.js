import Joi from "joi";

export const ArticleQuerySchema = Joi.object({
  q: Joi.string().allow("", null),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .pattern(/^[a-zA-Z_]+.(asc|desc)$/)
    .default("created_at.desc"),
});

export const ArticleCreateSchema = Joi.object({
  title: Joi.string().max(255).required(),
  cover_url: Joi.string().uri().allow(null, ""),
  cover_file: Joi.any(),
  content: Joi.string().allow(null, ""), // bisa simpan JSON string
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
}).xor("category_id", "category_name");

export const ArticleUpdateSchema = Joi.object({
  title: Joi.string().max(255),
  cover_url: Joi.string().uri().allow(null, ""),
  cover_file: Joi.any(),
  content: Joi.string().allow(null, ""),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
}).min(1);

export const CategoryQuerySchema = Joi.object({
  q: Joi.string().allow("", null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const CategoryCreateSchema = Joi.object({
  name: Joi.string().max(100).required(),
});

export const CategoryUpdateSchema = Joi.object({
  name: Joi.string().max(100).required(),
});
