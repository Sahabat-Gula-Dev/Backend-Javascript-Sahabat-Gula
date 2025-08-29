import * as AuthSchemas from "../../validator/auth/schema.js";

const routes = (handler) => [
  // for user registration
  {
    method: "POST",
    path: "/auth/register",
    handler: handler.postRegisterUserHandler,
    options: {
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
      validate: {
        payload: AuthSchemas.VerifyOtpPayloadSchema, 
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
    options: { validate: { payload: AuthSchemas.ForgotPasswordPayloadSchema } }, 
  },

  // for verifying reset password OTP
  {
    method: "POST",
    path: "/auth/verify-reset-otp",
    handler: handler.postVerifyResetOtpHandler,
    options: { validate: { payload: AuthSchemas.VerifyResetOtpPayloadSchema } },  
  },

  // for resetting password
  {
    method: "POST",
    path: "/auth/reset-password",
    handler: handler.postResetPasswordHandler,
    options: { validate: { payload: AuthSchemas.ResetPasswordPayloadSchema } }, 
  },

  // for user logout
  {
    method: "POST",
    path: "/auth/logout",
    handler: handler.postLogoutUserHandler,
    options: { validate: { payload: AuthSchemas.LogoutPayloadSchema } },  
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
