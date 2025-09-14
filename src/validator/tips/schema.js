import Joi from "joi";

export const TipCreateSchema = Joi.object({
  heading: Joi.string().max(255).allow(null, ""),
  content: Joi.string().allow(null, ""),
}).or("heading", "content");

export const TipUpdateSchema = Joi.object({
  heading: Joi.string().max(255).allow(null, ""),
  content: Joi.string().allow(null, ""),
}).or("heading", "content");

export const TipQuerySchema = Joi.object({});
