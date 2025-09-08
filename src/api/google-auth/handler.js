import * as GoogleSchemas from "../../validator/google-auth/schema.js";

export default class GoogleAuthHandler {
  constructor(service, tokenManager) {
    this._service = service;
    this._tokenManager = tokenManager;

    this.postGoogleAuthHandler = this.postGoogleAuthHandler.bind(this);
  }

  async postGoogleAuthHandler(request, h) {
    try {
      console.log("📥 Incoming request payload:", request.payload);

      const { idToken } = request.payload;

      console.log("✅ idToken diterima, mulai verifikasi ke Google...");
      const payload = await this._service.verifyGoogleIdToken(idToken);
      console.log("🔑 Google payload:", payload);

      const email = payload.email;
      const name = payload.name || email.split("@")[0];
      console.log(`👤 User info → email: ${email}, name: ${name}`);

      // cek / buat user
      const user = await this._service.findOrCreateUser({
        email,
        username: name,
      });
      console.log("🆔 User dari DB:", user);

      // bikin JWT internal
      const accessToken = this._tokenManager.createAccessToken(user);
      console.log("🎫 JWT internal dibuat:", accessToken);

      return h
        .response({
          status: "success",
          message: "Login dengan Google berhasil",
          data: { accessToken },
        })
        .code(200);
    } catch (err) {
      console.error("🔥 Error di postGoogleAuthHandler:", err);
      return h
        .response({
          status: "error",
          message: err.message || "Internal server error",
        })
        .code(500);
    }
  }
}
