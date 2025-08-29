import * as AuthSchemas from "../../validator/auth/schema.js";

const routes = (handler) => [
  // for user registration
  {
    method: "POST",
    path: "/auth/register",
    handler: handler.postRegisterUserHandler,
    options: {
      description: "Register a new user",
      tags: ["api", "auth"],
      validate: {
        payload: AuthSchemas.UserRegisterPayloadSchema,
      },
    },
  },

  // for OTP verification
  {
    method: "POST",
    path: "/auth/verify-otp",
    handler: handler.postVerifyOtpHandler,
    options: {
      description: "Verify OTP code to activate user account",
      tags: ["api", "auth"],
      validate: {
        payload: AuthSchemas.VerifyOtpPayloadSchema,
      },
    },
  },

  // for resending OTP
  {
    method: "POST",
    path: "/auth/resend-otp",
    handler: handler.postResendOtpHandler,
    options: {
      description: "Send a new OTP code to the user's email.",
      tags: ["api", "auth"],
      validate: {
        payload: AuthSchemas.ResendOtpPayloadSchema,
      },
    },
  },

  // for user login
  {
    method: "POST",
    path: "/auth/login",
    handler: handler.postLoginUserHandler,
    options: {
      description: "Login a user",
      tags: ["api", "auth"],
      validate: {
        payload: AuthSchemas.UserLoginPayloadSchema,
      },
    },
  },

  // for Google authentication
  {
    method: "POST",
    path: "/auth/google",
    handler: handler.postGoogleAuthHandler,
    options: {
      description: "Authenticate a user with Google",
      tags: ["api", "auth"],
      validate: {
        payload: AuthSchemas.GoogleAuthPayloadSchema,
      },
    },
  },

  // for token refresh
  {
    method: "POST",
    path: "/auth/refresh-token",
    handler: handler.postRefreshTokenHandler,
    options: {
      description: "Refresh access token using refresh token",
      tags: ["api", "auth"],
      validate: {
        payload: AuthSchemas.RefreshTokenPayloadSchema,
      },
    },
  },

  // for creating the first admin
  {
    method: "POST",
    path: "/admin/register-first",
    handler: handler.postCreateFirstAdminHandler,
    options: {
      description: "Create the first admin user",
      tags: ["api", "auth"],
      validate: {
        payload: AuthSchemas.FirstAdminPayloadSchema,
      },
    },
  },

  // for creating an admin
  {
    method: "POST",
    path: "/admin/register",
    handler: handler.postCreateAdminHandler,
    options: {
      description: "Create a new admin user",
      tags: ["api", "auth"],
      auth: "jwt",
      validate: {
        payload: AuthSchemas.UserRegisterPayloadSchema,
      },
    },
  },

  // for forgot password
  {
    method: "POST",
    path: "/auth/forgot-password",
    handler: handler.postForgotPasswordHandler,
    options: {
      description: "Send a password reset email",
      validate: { payload: AuthSchemas.ForgotPasswordPayloadSchema },
    },
  },

  // for verifying reset password OTP
  {
    method: "POST",
    path: "/auth/verify-reset-otp",
    handler: handler.postVerifyResetOtpHandler,
    options: {
      description: "Verify reset password OTP",
      validate: { payload: AuthSchemas.VerifyResetOtpPayloadSchema },
    },
  },

  // for resetting password
  {
    method: "POST",
    path: "/auth/reset-password",
    handler: handler.postResetPasswordHandler,
    options: {
      description: "Reset user password",
      validate: { payload: AuthSchemas.ResetPasswordPayloadSchema },
    },
  },

  // for user logout
  {
    method: "POST",
    path: "/auth/logout",
    handler: handler.postLogoutUserHandler,
    options: {
      description: "Logout user",
      validate: { payload: AuthSchemas.LogoutPayloadSchema },
    },
  },

  // for deleting user account
  {
    method: "DELETE",
    path: "/users/me",
    handler: handler.deleteUserAccountHandler,
    options: {
      description: "Delete user account",
      tags: ["api", "auth"],
      auth: "jwt",
      description: "Delete user account successfully",
    },
  },
];

export default routes;
