import * as AuthSchemas from "../../validator/auth/schema.js";

const routes = (handler) => [
  {
    method: "POST",
    path: "/auth/register",
    handler: handler.postRegisterUserHandler,
    options: {
      description: "Register user baru & kirim OTP aktivasi",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.UserRegisterPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/auth/verify-otp",
    handler: handler.postVerifyOtpHandler,
    options: {
      description: "Verifikasi OTP aktivasi dan aktifkan akun",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.VerifyOtpPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/auth/resend-otp",
    handler: handler.postResendOtpHandler,
    options: {
      description: "Kirim ulang OTP aktivasi",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.ResendOtpPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/auth/login",
    handler: handler.postLoginUserHandler,
    options: {
      description: "Login user",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.UserLoginPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/auth/forgot-password",
    handler: handler.postForgotPasswordHandler,
    options: {
      description: "Kirim OTP reset password bila email terdaftar",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.ForgotPasswordPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/auth/verify-reset-otp",
    handler: handler.postVerifyResetOtpHandler,
    options: {
      description: "Verifikasi OTP reset password dan terbitkan resetToken",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.VerifyResetOtpPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/auth/reset-password",
    handler: handler.postResetPasswordHandler,
    options: {
      description: "Reset password dengan resetToken yang valid",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.ResetPasswordPayloadSchema },
    },
  },
];

export default routes;
