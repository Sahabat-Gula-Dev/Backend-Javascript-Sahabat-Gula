import AuthValidator from "../../validator/auth/index.js";

const routes = (handler) => [
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
];

export default routes;
