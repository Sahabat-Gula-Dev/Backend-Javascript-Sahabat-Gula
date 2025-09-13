import Joi from "joi";

const unitStr = Joi.string().max(50);

export const FoodQuerySchema = Joi.object({
  q: Joi.string().allow("", null),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .pattern(/^[a-zA-Z_]+.(asc|desc)$/)
    .default("created_at.desc"),
});

export const FoodCreateSchema = Joi.object({
  name: Joi.string().max(200).required(),
  photo_url: Joi.string().uri().allow(null, ""),
  photo_file: Joi.any(), 
  description: Joi.string().allow(null, ""),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),  
  serving_size: Joi.number().integer().min(1).required(),
  serving_unit: unitStr.allow(null, ""),
  weight_size: Joi.number().integer().min(1).required(),
  weight_unit: unitStr.allow(null, ""),
  calories: Joi.number().precision(2).allow(null),
  carbs: Joi.number().precision(2).allow(null),
  protein: Joi.number().precision(2).allow(null),
  fat: Joi.number().precision(2).allow(null),
  sugar: Joi.number().precision(2).allow(null),
  sodium: Joi.number().precision(2).allow(null),
  fiber: Joi.number().precision(2).allow(null),
  potassium: Joi.number().precision(2).allow(null),
}).xor("category_id", "category_name");  

export const FoodUpdateSchema = Joi.object({
  name: Joi.string().max(200),
  photo_url: Joi.string().uri().allow(null, ""),
  photo_file: Joi.any(),
  description: Joi.string().allow(null, ""),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),  
  serving_size: Joi.number().integer().min(1),
  serving_unit: unitStr.allow(null, ""),
  weight_size: Joi.number().integer().min(1),
  weight_unit: unitStr.allow(null, ""),
  calories: Joi.number().precision(2).allow(null),
  carbs: Joi.number().precision(2).allow(null),
  protein: Joi.number().precision(2).allow(null),
  fat: Joi.number().precision(2).allow(null),
  sugar: Joi.number().precision(2).allow(null),
  sodium: Joi.number().precision(2).allow(null),
  fiber: Joi.number().precision(2).allow(null),
  potassium: Joi.number().precision(2).allow(null),
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
