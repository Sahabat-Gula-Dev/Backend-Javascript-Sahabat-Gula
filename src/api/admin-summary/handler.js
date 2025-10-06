export default class AdminSummaryHandler {
  constructor(service) {
    this._service = service;
    this.getAdminDashboardHandler = this.getAdminDashboardHandler.bind(this);
  }

  async getAdminDashboardHandler(request, h) {
    const data = await this._service.getAdminDashboard();
    return { status: "success", data };
  }
}
