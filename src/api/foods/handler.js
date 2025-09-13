export default class FoodsHandler {
  constructor(service) {
    this._service = service;

    this.getFoodsHandler = this.getFoodsHandler.bind(this);
    this.getFoodByIdHandler = this.getFoodByIdHandler.bind(this);
    this.postFoodHandler = this.postFoodHandler.bind(this);
    this.putFoodHandler = this.putFoodHandler.bind(this);
    this.deleteFoodHandler = this.deleteFoodHandler.bind(this);

    this.getCategoriesHandler = this.getCategoriesHandler.bind(this);
    this.postCategoryHandler = this.postCategoryHandler.bind(this);
    this.putCategoryHandler = this.putCategoryHandler.bind(this);
    this.deleteCategoryHandler = this.deleteCategoryHandler.bind(this);
  }

  async getFoodsHandler(request, h) {
    const result = await this._service.listFoods(request.query);
    return {
      status: "success",
      data: result.data,
      meta: result.meta,
    };
  }

  async getFoodByIdHandler(request, h) {
    const { id } = request.params;
    const food = await this._service.getFoodById(id);
    return {
      status: "success",
      data: { food },
    };
  }

  async postFoodHandler(request, h) {
    const food = await this._service.createFood(request.payload, {
      photo_file: request.payload.photo_file,
    });
    return h
      .response({
        status: "success",
        message: "Makanan berhasil ditambahkan",
        data: { food },
      })
      .code(201);
  }

  async putFoodHandler(request, h) {
    const { id } = request.params;
    const food = await this._service.updateFood(id, request.payload, {
      photo_file: request.payload.photo_file,
    });
    return {
      status: "success",
      message: "Makanan berhasil diperbarui",
      data: { food },
    };
  }

  async deleteFoodHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteFood(id);
    return {
      status: "success",
      message: "Makanan berhasil dihapus",
    };
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
        message: "Kategori dibuat",
        data: { category },
      })
      .code(201);
  }

  async putCategoryHandler(request, h) {
    const { id } = request.params;
    const category = await this._service.updateCategory(id, request.payload);
    return {
      status: "success",
      message: "Kategori diupdate",
      data: { category },
    };
  }

  async deleteCategoryHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteCategory(id);
    return {
      status: "success",
      message: "Kategori dihapus",
    };
  }
}
