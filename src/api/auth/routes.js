import AuthValidator from "../../validator/auth/index.js";

const routes = (handler) => [
  // for user registration
  {
    method: "POST",
    path: "/auth/register",
    handler: handler.postRegisterUserHandler,
    options: {
      validate: {
        payload: AuthValidator.UserRegisterPayloadSchema,
      },
    },
  },

  // for OTP verification
  {
    method: "POST",
    path: "/auth/verify-otp",
    handler: handler.postVerifyOtpHandler,
    options: {
      validate: {
        payload: AuthValidator.VerifyOtpPayloadSchema,
      },
    },
  },

  // for user login
  {
    method: "POST",
    path: "/auth/login",
    handler: handler.postLoginUserHandler,
    options: {
      validate: {
        payload: AuthValidator.UserLoginPayloadSchema,
      },
    },
  },

  // for Google authentication
  {
    method: "POST",
    path: "/auth/google",
    handler: handler.postGoogleAuthHandler,
    options: {
      validate: {
        payload: AuthValidator.GoogleAuthPayloadSchema,
      },
    },
  },

  // for token refresh
  {
    method: "POST",
    path: "/auth/refresh-token",
    handler: handler.postRefreshTokenHandler,
    options: {
      validate: {
        payload: AuthValidator.RefreshTokenPayloadSchema,
      },
    },
  },

  // for creating the first admin
  {
    method: "POST",
    path: "/auth/create-first-admin",
    handler: handler.postCreateFirstAdminHandler,
    options: {
      validate: {
        payload: AuthValidator.FirstAdminPayloadSchema,
      },
    },
  },

  // for creating an admin
  {
    method: "POST",
    path: "/auth/create-admin",
    handler: handler.postCreateAdminHandler,
    options: {
      auth: "jwt",
      validate: {
        payload: AuthValidator.AdminRegisterPayloadSchema,
      },
    },
  },

  // for forgot password
  {
    method: "POST",
    path: "/auth/forgot-password",
    handler: handler.postForgotPasswordHandler,
    options: { validate: { payload: ForgotPasswordPayloadSchema } },
  },

  // for verifying reset password OTP
  {
    method: "POST",
    path: "/auth/verify-reset-otp",
    handler: handler.postVerifyResetOtpHandler,
    options: { validate: { payload: VerifyResetOtpPayloadSchema } },
  },

  // for resetting password
  {
    method: "POST",
    path: "/auth/reset-password",
    handler: handler.postResetPasswordHandler,
    options: { validate: { payload: ResetPasswordPayloadSchema } },
  },

  // for user logout
  {
    method: "POST",
    path: "/auth/logout",
    handler: handler.postLogoutUserHandler,
    options: { validate: { payload: LogoutPayloadSchema } },
  },

  // for deleting user account
  {
    method: "DELETE",
    path: "/users/me",
    handler: handler.deleteUserAccountHandler,
    options: {
      auth: "jwt",
      description: "Delete user account successfully",
    },
  },
];

export default routes;
