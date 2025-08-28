import AuthenticationError from "../../exceptions/AuthenticationError.js";
import InvariantError from "../../exceptions/InvariantError.js";

class AuthHandler {
  constructor(service, tokenManager) {
    this._service = service;
    this._tokenManager = tokenManager;

    this.postRegisterUserHandler = this.postRegisterUserHandler.bind(this);
    this.postVerifyOtpHandler = this.postVerifyOtpHandler.bind(this);
    this.postLoginUserHandler = this.postLoginUserHandler.bind(this);
    this.postGoogleAuthHandler = this.postGoogleAuthHandler.bind(this);
    this.postRefreshTokenHandler = this.postRefreshTokenHandler.bind(this);
    this.postCreateFirstAdminHandler =
      this.postCreateFirstAdminHandler.bind(this);
    this.postCreateAdminHandler = this.postCreateAdminHandler.bind(this);
  }

  async postRegisterUserHandler(request, h) {
    const { username, email, password } = request.payload;
    await this._service.registerUser({ username, email, password });
    return h
      .response({
        status: "success",
        message:
          "User registered successfully. Please verify your email to activate your account.",
      })
      .code(201);
  }

  async postVerifyOtpHandler(request, h) {
    const userData = await this._service.verifyOtpAndActiveUser(
      request.payload
    );
    const accessToken = this._tokenManager.createAccessToken(userData);
    const refreshToken = this._tokenManager.createRefreshToken(userData);
    return {
      status: "success",
      message: "OTP verified successfully",
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  async postLoginUserHandler(request, h) {
    const userData = await this._service.loginUser(request.payload);
    const accessToken = this._tokenManager.createAccessToken(userData);
    const refreshToken = this._tokenManager.createRefreshToken(userData);
    return {
      status: "success",
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  async postGoogleAuthHandler(request, h) {
    const userData = await this._service.handleGoogleAuth(request.payload)
      .supabaseAccessToken;
    const accessToken = this._tokenManager.createAccessToken(userData);
    const refreshToken = this._tokenManager.createRefreshToken(userData);
    return {
      status: "success",
      message: "Google authentication successful",
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  async postRefreshTokenHandler(request, h) {
    const { refreshToken } = request.payload;
    const userData = this._tokenManager.verifyRefreshToken(refreshToken);
    const newAccessToken = this._tokenManager.createAccessToken(userData);
    return {
      status: "success",
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    };
  }

  async postCreateFirstAdminHandler(request, h) {
    const { adminKey, username, email, password } = request.payload;
    if (adminKey !== process.env.SUPER_ADMIN_KEY) {
      throw new AuthenticationError("Invalid admin key");
    }
    await this._service.createFirstAdmin({ username, email, password });
    return h
      .response({
        status: "success",
        message: "First admin created successfully",
      })
      .code(201);
  }

  async postCreateAdminHandler(request, h) {
    const { username, email, password } = request.payload;
    const actorId = request.auth.credentials.id;
    await this._service.createAdmin(actorId, { username, email, password });
    return h
      .response({
        status: "success",
        message: "Admin created successfully",
      })
      .code(201);
  }
}


export default AuthHandler;
