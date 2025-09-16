export default class LogsHandler {
  constructor(service) {
    this._service = service;

    this.postFoodLogsHandler = this.postFoodLogsHandler.bind(this);
    this.postActivityLogsHandler = this.postActivityLogsHandler.bind(this);
    this.postStepLogsHandler = this.postStepLogsHandler.bind(this);
    this.postWaterLogsHandler = this.postWaterLogsHandler.bind(this);
  }

  async postFoodLogsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const result = await this._service.logFoods(userId, request.payload.foods);

    return h
      .response({
        status: "success",
        message: "Konsumsi makanan berhasil dicatat",
        data: result,
      })
      .code(201);
  }

  async postActivityLogsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const result = await this._service.logActivities(
      userId,
      request.payload.activities
    );

    return h
      .response({
        status: "success",
        message: "Aktivitas berhasil dicatat",
        data: result,
      })
      .code(201);
  }

  async postStepLogsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const result = await this._service.logSteps(userId, request.payload.steps);

    return h
      .response({
        status: "success",
        message: "Langkah berhasil dicatat",
        data: result,
      })
      .code(201);
  }

  async postWaterLogsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const result = await this._service.logWater(userId, request.payload.amount);

    return h
      .response({
        status: "success",
        message: "Konsumsi air berhasil dicatat",
        data: result,
      })
      .code(201);
  }
}
