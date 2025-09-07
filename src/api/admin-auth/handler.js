
export default class AdminAuthHandler {
  constructor(service, tokenManager) {
    this._service = service;
    this._tokenManager = tokenManager;

    this.postRegisterSuperAdminHandler =
      this.postRegisterSuperAdminHandler.bind(this);
    this.postCreateAccountHandler = this.postCreateAccountHandler.bind(this);
  }

  async postRegisterSuperAdminHandler(request, h) {
    const { username, email, password } = request.payload;
    const superAdmin = await this._service.registerSuperAdmin({
      username,
      email,
      password,
    });
    const accessToken = this._tokenManager.createAccessToken(superAdmin);
    return h
      .response({
        status: "success",
        message: "Super admin berhasil dibuat.",
        data: { accessToken },
      })
      .code(201);
  }

  async postCreateAccountHandler(request, h) {
    const { username, email, password, role } = request.payload;
    const account = await this._service.createAccount({
      username,
      email,
      password,
      role,
    });
    return h
      .response({
        status: "success",
        message: `Akun ${role} berhasil dibuat.`,
        data: account,
      })
      .code(201);
  }
}
