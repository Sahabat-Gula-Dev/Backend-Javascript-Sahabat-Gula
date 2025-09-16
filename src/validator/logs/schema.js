import Joi from "joi";

export const FoodLogSchema = Joi.object({
  foods: Joi.array()
    .items(
      Joi.object({
        food_id: Joi.string().uuid().required(),
        portion: Joi.number().integer().min(1).default(1),
      })
    )
    .min(1)
    .required(),
});

export const ActivityLogSchema = Joi.object({
  activities: Joi.array()
    .items(
      Joi.object({
        activity_id: Joi.string().uuid().required(),
      })
    )
    .min(1)
    .required(),
});

export const StepLogSchema = Joi.object({
  steps: Joi.number().integer().min(1).required(),
});

export const WaterLogSchema = Joi.object({
  amount: Joi.number().integer().min(1).required(), // ml
});
