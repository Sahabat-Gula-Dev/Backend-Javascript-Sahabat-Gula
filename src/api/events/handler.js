export default class EventsHandler {
  constructor(service) {
    this._service = service;

    this.getEventsHandler = this.getEventsHandler.bind(this);
    this.getEventByIdHandler = this.getEventByIdHandler.bind(this);
    this.postEventHandler = this.postEventHandler.bind(this);
    this.putEventHandler = this.putEventHandler.bind(this);
    this.deleteEventHandler = this.deleteEventHandler.bind(this);

    this.getCategoriesHandler = this.getCategoriesHandler.bind(this);
    this.postCategoryHandler = this.postCategoryHandler.bind(this);
    this.putCategoryHandler = this.putCategoryHandler.bind(this);
    this.deleteCategoryHandler = this.deleteCategoryHandler.bind(this);
  }

  async getEventsHandler(request, h) {
    const result = await this._service.listEvents(request.query);
    return { status: "success", data: result.data, meta: result.meta };
  }

  async getEventByIdHandler(request, h) {
    const { id } = request.params;
    const event = await this._service.getEventById(id);
    return { status: "success", data: { event } };
  }

  async postEventHandler(request, h) {
    const { id: author_id } = request.auth.credentials;
    const event = await this._service.createEvent(
      { ...request.payload, author_id },
      { cover_file: request.payload.cover_file }
    );
    return h
      .response({
        status: "success",
        message: "Event berhasil ditambahkan",
        data: { event },
      })
      .code(201);
  }

  async putEventHandler(request, h) {
    const { id } = request.params;
    const event = await this._service.updateEvent(id, request.payload, {
      cover_file: request.payload.cover_file,
    });
    return {
      status: "success",
      message: "Event berhasil diperbarui",
      data: { event },
    };
  }

  async deleteEventHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteEvent(id);
    return { status: "success", message: "Event berhasil dihapus" };
  }

  async getCategoriesHandler(request, h) {
    const result = await this._service.listCategories(request.query);
    return { status: "success", data: result.data, meta: result.meta };
  }

  async postCategoryHandler(request, h) {
    const category = await this._service.createCategory(request.payload);
    return h
      .response({
        status: "success",
        message: "Kategori event dibuat",
        data: { category },
      })
      .code(201);
  }

  async putCategoryHandler(request, h) {
    const { id } = request.params;
    const category = await this._service.updateCategory(id, request.payload);
    return {
      status: "success",
      message: "Kategori event diupdate",
      data: { category },
    };
  }

  async deleteCategoryHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteCategory(id);
    return { status: "success", message: "Kategori event dihapus" };
  }
}
