import {
  UserRegisterPayloadSchema,
  UserLoginPayloadSchema,
  VerifyOtpPayloadSchema,
  GoogleAuthPayloadSchema,
  FirstAdminPayloadSchema,
} from "./schema.js";

import InvariantError from "../../exceptions/InvariantError.js";

const AuthValidator ={
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
}

export default AuthValidator;
