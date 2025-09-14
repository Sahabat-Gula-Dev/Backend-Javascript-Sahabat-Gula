import Joi from "joi";

const unitStr = Joi.string().max(50);

export const ActivityQuerySchema = Joi.object({
  q: Joi.string().allow("", null),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .pattern(/^[a-zA-Z_]+.(asc|desc)$/)
    .default("created_at.desc"),
});

export const ActivityCreateSchema = Joi.object({
  name: Joi.string().max(200).required(),
  photo_url: Joi.string().uri().allow(null, ""),
  photo_file: Joi.any(),
  description: Joi.string().allow(null, ""),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
  calories_burned: Joi.number().integer().min(0).allow(null),
  duration: Joi.number().integer().min(1).allow(null),
  duration_unit: unitStr.allow(null, ""),
}).xor("category_id", "category_name");

export const ActivityUpdateSchema = Joi.object({
  name: Joi.string().max(200),
  photo_url: Joi.string().uri().allow(null, ""),
  photo_file: Joi.any(),
  description: Joi.string().allow(null, ""),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
  calories_burned: Joi.number().integer().min(0).allow(null),
  duration: Joi.number().integer().min(1).allow(null),
  duration_unit: unitStr.allow(null, ""),
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
