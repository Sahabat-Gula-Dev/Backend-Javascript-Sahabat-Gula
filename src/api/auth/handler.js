import InvariantError from "../../exceptions/InvariantError.js";
import AuthenticationError from "../../exceptions/AuthenticationError.js";

export default class AuthHandler {
  constructor(service, tokenManager) {
    this._service = service;
    this._tokenManager = tokenManager;

    this.postRegisterUserHandler = this.postRegisterUserHandler.bind(this);
    this.postVerifyOtpHandler = this.postVerifyOtpHandler.bind(this);
    this.postResendOtpHandler = this.postResendOtpHandler.bind(this);
    this.postLoginUserHandler = this.postLoginUserHandler.bind(this);
    this.postForgotPasswordHandler = this.postForgotPasswordHandler.bind(this);
    this.postVerifyResetOtpHandler = this.postVerifyResetOtpHandler.bind(this);
    this.postResetPasswordHandler = this.postResetPasswordHandler.bind(this);
  }

  async postRegisterUserHandler(request, h) {
    const { username, email, password } = request.payload;
    await this._service.registerUser({ username, email, password });
    return h
      .response({
        status: "success",
        message: "Registrasi berhasil. Kode OTP telah dikirim ke email Anda.",
      })
      .code(201);
  }

  async postVerifyOtpHandler(request, h) {
    const user = await this._service.verifyOtpAndActivate(request.payload);
    const accessToken = this._tokenManager.createAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });
    return {
      status: "success",
      message: "Verifikasi berhasil. Akun aktif.",
      data: { accessToken },
    };
  }

  async postResendOtpHandler(request, h) {
    const { email } = request.payload;
    await this._service.resendActivationOtp(email);
    return {
      status: "success",
      message: "OTP baru telah dikirim ke email Anda.",
    };
  }

  async postLoginUserHandler(request, h) {
    const { email, password } = request.payload;
    const user = await this._service.login({ email, password });
    const accessToken = this._tokenManager.createAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });
    return {
      status: "success",
      message: "Login berhasil.",
      data: { accessToken },
    };
  }

  async postForgotPasswordHandler(request, h) {
    const { email } = request.payload;
    await this._service.requestPasswordReset(email);
    return {
      status: "success",
      message: "OTP reset password telah dikirim ke email bila terdaftar.",
    };
  }

  async postVerifyResetOtpHandler(request, h) {
    // Jika valid, kembalikan resetToken (JWT scope khusus)
    const { id } = await this._service.verifyPasswordResetOtp(request.payload);
    const resetToken = this._tokenManager.createAccessToken({
      id,
      scope: "reset-password",
    });
    return {
      status: "success",
      message: "OTP valid. Silakan reset password.",
      data: { resetToken },
    };
  }

  async postResetPasswordHandler(request, h) {
    const { resetToken, newPassword } = request.payload;
    const payload = this._tokenManager.verifyAccessToken(resetToken);
    if (payload.scope !== "reset-password") {
      throw new InvariantError("Token reset tidak valid.");
    }
    await this._service.resetPassword(payload.id, newPassword);
    return {
      status: "success",
      message: "Password berhasil direset. Silakan login kembali.",
    };
  }
}
