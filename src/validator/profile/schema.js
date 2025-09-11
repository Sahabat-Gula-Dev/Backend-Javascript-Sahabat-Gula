import Joi from "joi";

export const ProfileSetupSchema = Joi.object({
  gender: Joi.string().valid("Laki-laki", "Perempuan").required(),
  age: Joi.number().integer().min(1).max(120).required(),
  height: Joi.number().integer().min(50).max(250).required(),
  weight: Joi.number().integer().min(10).max(300).required(),
  waist_circumference: Joi.number().integer().min(30).max(200).required(),
  blood_pressure: Joi.boolean().required(),
  blood_sugar: Joi.boolean().required(),
  eat_vegetables: Joi.boolean().required(),
  diabetes_family: Joi.string()
    .valid("Tingkat Satu", "Tingkat Dua", "Tidak Ada")
    .required(),
  activity_level: Joi.string()
    .valid("Tidak Aktif", "Ringan", "Sedang", "Berat", "Sangat Berat")
    .required(),
});
