import {
  UserRegisterPayloadSchema,
  UserLoginPayloadSchema,
  VerifyOtpPayloadSchema,
  ForgotPasswordPayloadSchema,
  GoogleAuthPayloadSchema,
  FirstAdminPayloadSchema,
  VerifyResetOtpPayloadSchema,
  ResetPasswordPayloadSchema,
  LogoutPayloadSchema,
} from "./schema.js";

import InvariantError from "../../exceptions/InvariantError.js";

const AuthValidator = {
  validateUserRegisterPayload: (payload) => {
    const { error } = UserRegisterPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateUserLoginPayload: (payload) => {
    const { error } = UserLoginPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateVerifyOtpPayload: (payload) => {
    const { error } = VerifyOtpPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateGoogleAuthPayload: (payload) => {
    const { error } = GoogleAuthPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateFirstAdminPayload: (payload) => {
    const { error } = FirstAdminPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateForgotPasswordPayload: (payload) => {
    const { error } = ForgotPasswordPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateVerifyResetOtpPayload: (payload) => {
    const { error } = VerifyResetOtpPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateResetPasswordPayload: (payload) => {
    const { error } = ResetPasswordPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },

  validateLogoutPayload: (payload) => {
    const { error } = LogoutPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },
};

export default AuthValidator;
