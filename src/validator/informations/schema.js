import Joi from "joi";

export const InformationCreateSchema = Joi.object({
  heading: Joi.string().max(255).allow(null, ""),
  content: Joi.string().allow(null, ""),
}).or("heading", "content");  


export const InformationUpdateSchema = Joi.object({
  heading: Joi.string().max(255).allow(null, ""),
  content: Joi.string().allow(null, ""),
}).or("heading", "content");  

export const InformationQuerySchema = Joi.object({});
