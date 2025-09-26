export default class SummaryHandler {
  constructor(service) {
    this._service = service;

    this.getAllSummaryHandler = this.getAllSummaryHandler.bind(this);
  }

  async getAllSummaryHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const data = await this._service.getAllSummary(userId);

    return {
      status: "success",
      data,
    };
  }

  async getHistoryHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const limit = request.query.limit ?? 3;
    const data = await this._service.getHistory(userId, limit);
    return { status: "success", data };
  }
}
