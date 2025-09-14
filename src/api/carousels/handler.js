export default class CarouselsHandler {
  constructor(service) {
    this._service = service;

    this.getCarouselsHandler = this.getCarouselsHandler.bind(this);
    this.getCarouselByIdHandler = this.getCarouselByIdHandler.bind(this);
    this.postCarouselHandler = this.postCarouselHandler.bind(this);
    this.putCarouselHandler = this.putCarouselHandler.bind(this);
    this.deleteCarouselHandler = this.deleteCarouselHandler.bind(this);
  }

  async getCarouselsHandler(request, h) {
    const result = await this._service.listCarousels(request.query);
    return { status: "success", data: result.data, meta: result.meta };
  }

  async getCarouselByIdHandler(request, h) {
    const { id } = request.params;
    const carousel = await this._service.getCarouselById(id);
    return { status: "success", data: { carousel } };
  }

  async postCarouselHandler(request, h) {
    const carousel = await this._service.createCarousel(request.payload, {
      image_file: request.payload.image_file,
    });
    return h
      .response({
        status: "success",
        message: "Carousel berhasil ditambahkan",
        data: { carousel },
      })
      .code(201);
  }

  async putCarouselHandler(request, h) {
    const { id } = request.params;
    const carousel = await this._service.updateCarousel(id, request.payload, {
      image_file: request.payload.image_file,
    });
    return {
      status: "success",
      message: "Carousel berhasil diperbarui",
      data: { carousel },
    };
  }

  async deleteCarouselHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteCarousel(id);
    return { status: "success", message: "Carousel berhasil dihapus" };
  }
}
