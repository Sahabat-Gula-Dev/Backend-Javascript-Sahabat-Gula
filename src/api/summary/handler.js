export default class SummaryHandler {
  constructor(service) {
    this._service = service;

    this.getTodayHandler = this.getTodayHandler.bind(this);
    this.getWeeklyHandler = this.getWeeklyHandler.bind(this);
    this.getMonthlyHandler = this.getMonthlyHandler.bind(this);
    this.getHistoryHandler = this.getHistoryHandler.bind(this);
  }

  async getTodayHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const data = await this._service.getTodaySummary(userId);

    return h.response({ status: "success", data }).code(200);
  }

  async getWeeklyHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const data = await this._service.getWeeklySummary(userId);
    return { status: "success", data };
  }

  async getMonthlyHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const data = await this._service.getMonthlySummary(userId);
    return { status: "success", data };
  }

  async getHistoryHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const limit = request.query.limit ?? 3;
    const data = await this._service.getHistory(userId, limit);
    return { status: "success", data };
  }
}
