export default class ActivitiesHandler {
  constructor(service) {
    this._service = service;

    this.getActivitiesHandler = this.getActivitiesHandler.bind(this);
    this.getActivityByIdHandler = this.getActivityByIdHandler.bind(this);
    this.postActivityHandler = this.postActivityHandler.bind(this);
    this.putActivityHandler = this.putActivityHandler.bind(this);
    this.deleteActivityHandler = this.deleteActivityHandler.bind(this);

    this.getCategoriesHandler = this.getCategoriesHandler.bind(this);
    this.postCategoryHandler = this.postCategoryHandler.bind(this);
    this.putCategoryHandler = this.putCategoryHandler.bind(this);
    this.deleteCategoryHandler = this.deleteCategoryHandler.bind(this);
  }

  async getActivitiesHandler(request, h) {
    const result = await this._service.listActivities(request.query);
    return {
      status: "success",
      data: result.data,
      meta: result.meta,
    };
  }

  async getActivityByIdHandler(request, h) {
    const { id } = request.params;
    const activity = await this._service.getActivityById(id);
    return { status: "success", data: { activity } };
  }

  async postActivityHandler(request, h) {
    const activity = await this._service.createActivity(request.payload, {
      photo_file: request.payload.photo_file,
    });
    return h
      .response({
        status: "success",
        message: "Aktivitas berhasil ditambahkan",
        data: { activity },
      })
      .code(201);
  }

  async putActivityHandler(request, h) {
    const { id } = request.params;
    const activity = await this._service.updateActivity(id, request.payload, {
      photo_file: request.payload.photo_file,
    });
    return {
      status: "success",
      message: "Aktivitas berhasil diperbarui",
      data: { activity },
    };
  }

  async deleteActivityHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteActivity(id);
    return { status: "success", message: "Aktivitas berhasil dihapus" };
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
        message: "Kategori aktivitas dibuat",
        data: { category },
      })
      .code(201);
  }

  async putCategoryHandler(request, h) {
    const { id } = request.params;
    const category = await this._service.updateCategory(id, request.payload);
    return {
      status: "success",
      message: "Kategori aktivitas diupdate",
      data: { category },
    };
  }

  async deleteCategoryHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteCategory(id);
    return { status: "success", message: "Kategori aktivitas dihapus" };
  }
}
