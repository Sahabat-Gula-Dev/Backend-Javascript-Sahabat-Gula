export default class InformationsHandler {
  constructor(service) {
    this._service = service;

    this.getRandomInformationHandler =
      this.getRandomInformationHandler.bind(this);
    this.getInformationByIdHandler = this.getInformationByIdHandler.bind(this);
    this.postInformationHandler = this.postInformationHandler.bind(this);
    this.putInformationHandler = this.putInformationHandler.bind(this);
    this.deleteInformationHandler = this.deleteInformationHandler.bind(this);
  }

  async getRandomInformationHandler(request, h) {
    const information = await this._service.getRandomInformation();
    return { status: "success", data: { information } };
  }

  async getInformationByIdHandler(request, h) {
    const { id } = request.params;
    const information = await this._service.getInformationById(id);
    return { status: "success", data: { information } };
  }

  async postInformationHandler(request, h) {
    const information = await this._service.createInformation(request.payload);
    return h
      .response({
        status: "success",
        message: "Information berhasil ditambahkan",
        data: { information },
      })
      .code(201);
  }

  async putInformationHandler(request, h) {
    const { id } = request.params;
    const information = await this._service.updateInformation(
      id,
      request.payload
    );
    return {
      status: "success",
      message: "Information berhasil diperbarui",
      data: { information },
    };
  }

  async deleteInformationHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteInformation(id);
    return { status: "success", message: "Information berhasil dihapus" };
  }
}
