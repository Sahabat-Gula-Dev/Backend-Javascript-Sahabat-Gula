import * as AuthSchemas from "../../validator/auth/schema.js";

const routes = (handler) => [
  {
    method: "POST",
    path: "/register",
    handler: handler.postRegisterUserHandler,
    options: {
      description: "Register user baru & kirim OTP aktivasi",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.UserRegisterPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/verify-otp",
    handler: handler.postVerifyOtpHandler,
    options: {
      description: "Verifikasi OTP aktivasi dan aktifkan akun",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.VerifyOtpPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/resend-otp",
    handler: handler.postResendOtpHandler,
    options: {
      description: "Kirim ulang OTP aktivasi",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.ResendOtpPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/login",
    handler: handler.postLoginUserHandler,
    options: {
      description: "Login user",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.UserLoginPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/forgot-password",
    handler: handler.postForgotPasswordHandler,
    options: {
      description: "Kirim OTP reset password bila email terdaftar",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.ForgotPasswordPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/verify-reset-otp",
    handler: handler.postVerifyResetOtpHandler,
    options: {
      description: "Verifikasi OTP reset password dan terbitkan resetToken",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.VerifyResetOtpPayloadSchema },
    },
  },
  {
    method: "POST",
    path: "/reset-password",
    handler: handler.postResetPasswordHandler,
    options: {
      description: "Reset password dengan resetToken yang valid",
      tags: ["api", "auth"],
      validate: { payload: AuthSchemas.ResetPasswordPayloadSchema },
    },
  },
];

export default routes;
