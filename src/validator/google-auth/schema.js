import Joi from "joi";

export const GoogleAuthPayloadSchema = Joi.object({
  idToken: Joi.string().required(),
});