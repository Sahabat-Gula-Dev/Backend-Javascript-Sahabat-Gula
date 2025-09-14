import Joi from "joi";

export const FaqQuerySchema = Joi.object({
  q: Joi.string().allow("", null),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .pattern(/^[a-zA-Z_]+.(asc|desc)$/)
    .default("created_at.desc"),
});

export const FaqCreateSchema = Joi.object({
  question: Joi.string().max(500).required(),
  answer: Joi.string().required(),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
}).xor("category_id", "category_name");

export const FaqUpdateSchema = Joi.object({
  question: Joi.string().max(500),
  answer: Joi.string(),
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
