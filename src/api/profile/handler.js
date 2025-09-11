export default class ProfileHandler {
  constructor(service) {
    this._service = service;
    this.postSetupProfileHandler = this.postSetupProfileHandler.bind(this);
    this.getMyProfileSetupHandler = this.getMyProfileSetupHandler.bind(this);
  }

  async postSetupProfileHandler(request, h) {
    const {id } = request.auth.credentials;
    const result = await this._service.setupProfile(id, request.payload);
    return h
      .response({
        status: "succes",
        message: "Profil berhasil disimpan",
        data: result,
      })
      .code(201);
  }

  async getMyProfileSetupHandler(request, h) {
    const {id } = request.auth.credentials;
    const profile = await this._service.getProfileDataSetup(id);
    return {
      status: "success",
      data: { profile },
    };
  }
}
