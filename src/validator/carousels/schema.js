import Joi from "joi";

export const CarouselQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .pattern(/^[a-zA-Z_]+.(asc|desc)$/)
    .default("created_at.desc"),
});

export const CarouselCreateSchema = Joi.object({
  image_url: Joi.string().uri().allow(null, ""), 
  image_file: Joi.any(),  
  target_url: Joi.string().uri().allow(null, "").optional(),
});

export const CarouselUpdateSchema = Joi.object({
  image_url: Joi.string().uri().allow(null, ""),
  image_file: Joi.any(),
  target_url: Joi.string().uri().allow(null, "").optional(),
}).min(1);
