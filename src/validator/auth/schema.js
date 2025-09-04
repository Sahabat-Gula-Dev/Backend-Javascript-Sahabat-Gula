import Joi from "joi";

export const UserRegisterPayloadSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const UserLoginPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const VerifyOtpPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const ResendOtpPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const ForgotPasswordPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const VerifyResetOtpPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const ResetPasswordPayloadSchema = Joi.object({
  resetToken: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});
