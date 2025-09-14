import Joi from "joi";

export const EventQuerySchema = Joi.object({
  q: Joi.string().allow("", null),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .pattern(/^[a-zA-Z_]+.(asc|desc)$/)
    .default("created_at.desc"),
});

export const EventCreateSchema = Joi.object({
  title: Joi.string().max(255).required(),
  event_date: Joi.date().required(),
  event_start: Joi.string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .required(), // HH:mm[:ss]
  event_end: Joi.string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .required(),
  location: Joi.string().allow(null, ""),
  location_detail: Joi.string().allow(null, ""),
  cover_url: Joi.string().uri().allow(null, ""),
  cover_file: Joi.any(),
  content: Joi.string().allow(null, ""),
  category_id: Joi.number().integer().min(1),
  category_name: Joi.string().max(100),
}).xor("category_id", "category_name");

export const EventUpdateSchema = Joi.object({
  title: Joi.string().max(255),
  event_date: Joi.date(),
  event_start: Joi.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  event_end: Joi.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  location: Joi.string().allow(null, ""),
  location_detail: Joi.string().allow(null, ""),
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
