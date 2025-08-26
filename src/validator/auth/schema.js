import Joi from "joi";

const UserRegisterPayloadSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const UserLoginPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const VerifyOtpPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const GoogleAuthPayloadSchema = Joi.object({
  supabaseAccessToken: Joi.string().required(),
});

const FirstAdminPayloadSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  adminKey: Joi.string().required(),
});

export {
  UserRegisterPayloadSchema,
  UserLoginPayloadSchema,
  VerifyOtpPayloadSchema,
  GoogleAuthPayloadSchema,
  FirstAdminPayloadSchema,
};
