export default class TipsHandler {
  constructor(service) {
    this._service = service;

    this.getRandomTipHandler = this.getRandomTipHandler.bind(this);
    this.getTipByIdHandler = this.getTipByIdHandler.bind(this);
    this.postTipHandler = this.postTipHandler.bind(this);
    this.putTipHandler = this.putTipHandler.bind(this);
    this.deleteTipHandler = this.deleteTipHandler.bind(this);
  }

  async getRandomTipHandler(request, h) {
    const tip = await this._service.getRandomTip();
    return { status: "success", data: { tip } };
  }

  async getTipByIdHandler(request, h) {
    const { id } = request.params;
    const tip = await this._service.getTipById(id);
    return { status: "success", data: { tip } };
  }

  async postTipHandler(request, h) {
    const tip = await this._service.createTip(request.payload);
    return h
      .response({
        status: "success",
        message: "Tips berhasil ditambahkan",
        data: { tip },
      })
      .code(201);
  }

  async putTipHandler(request, h) {
    const { id } = request.params;
    const tip = await this._service.updateTip(id, request.payload);
    return {
      status: "success",
      message: "Tips berhasil diperbarui",
      data: { tip },
    };
  }

  async deleteTipHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteTip(id);
    return { status: "success", message: "Tips berhasil dihapus" };
  }
}
