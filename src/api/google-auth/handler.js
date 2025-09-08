export default class GoogleAuthHandler {
  constructor(service, tokenManager) {
    this._service = service;
    this._tokenManager = tokenManager;

    this.postGoogleAuthHandler = this.postGoogleAuthHandler.bind(this);
  }

  async postGoogleAuthHandler(request, h) {
    try {
      const { idToken } = request.payload;
      const payload = await this._service.verifyGoogleIdToken(idToken);
      const email = payload.email;
      const name = payload.name || email.split("@")[0];

      // cek / buat user
      const user = await this._service.findOrCreateUser({
        email,
        username: name,
      });

      // buat JWT internal
      const accessToken = this._tokenManager.createAccessToken(user);

      return h
        .response({
          status: "success",
          message: "Login dengan Google berhasil",
          data: { accessToken },
        })
        .code(200);
    } catch (err) {
      return h
        .response({
          status: "error",
          message: err.message || "Internal server error",
        })
        .code(500);
    }
  }
}
