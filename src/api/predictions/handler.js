export default class PredictionHandler {
  constructor(service) {
    this._service = service;
    this.postPredictionHandler = this.postPredictionHandler.bind(this);
  }

  async postPredictionHandler(request, h) {
    const { image } = request.payload;

    const result = await this._service.predict(image);

    return h
      .response({
        status: "success",
        message: `Prediksi berhasil, hasil terbaik: ${result.predicted_name}`,
        data: result,
      })
      .code(201);
  }
}
