import Joi from "joi";

export const PredictionSchema = Joi.object({
  image: Joi.any().required(), 
});
