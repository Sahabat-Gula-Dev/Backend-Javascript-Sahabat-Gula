export default class FaqsHandler {
  constructor(service) {
    this._service = service;

    this.getFaqsHandler = this.getFaqsHandler.bind(this);
    this.getFaqByIdHandler = this.getFaqByIdHandler.bind(this);
    this.postFaqHandler = this.postFaqHandler.bind(this);
    this.putFaqHandler = this.putFaqHandler.bind(this);
    this.deleteFaqHandler = this.deleteFaqHandler.bind(this);

    this.getCategoriesHandler = this.getCategoriesHandler.bind(this);
    this.postCategoryHandler = this.postCategoryHandler.bind(this);
    this.putCategoryHandler = this.putCategoryHandler.bind(this);
    this.deleteCategoryHandler = this.deleteCategoryHandler.bind(this);
  }

  async getFaqsHandler(request, h) {
    const result = await this._service.listFaqs(request.query);
    return { status: "success", data: result.data, meta: result.meta };
  }

  async getFaqByIdHandler(request, h) {
    const { id } = request.params;
    const faq = await this._service.getFaqById(id);
    return { status: "success", data: { faq } };
  }

  async postFaqHandler(request, h) {
    const faq = await this._service.createFaq(request.payload);
    return h
      .response({
        status: "success",
        message: "FAQ berhasil ditambahkan",
        data: { faq },
      })
      .code(201);
  }

  async putFaqHandler(request, h) {
    const { id } = request.params;
    const faq = await this._service.updateFaq(id, request.payload);
    return {
      status: "success",
      message: "FAQ berhasil diperbarui",
      data: { faq },
    };
  }

  async deleteFaqHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteFaq(id);
    return { status: "success", message: "FAQ berhasil dihapus" };
  }

  // Categories
  async getCategoriesHandler(request, h) {
    const result = await this._service.listCategories(request.query);
    return { status: "success", data: result.data, meta: result.meta };
  }

  async postCategoryHandler(request, h) {
    const category = await this._service.createCategory(request.payload);
    return h
      .response({
        status: "success",
        message: "Kategori FAQ dibuat",
        data: { category },
      })
      .code(201);
  }

  async putCategoryHandler(request, h) {
    const { id } = request.params;
    const category = await this._service.updateCategory(id, request.payload);
    return {
      status: "success",
      message: "Kategori FAQ diupdate",
      data: { category },
    };
  }

  async deleteCategoryHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteCategory(id);
    return { status: "success", message: "Kategori FAQ dihapus" };
  }
}
