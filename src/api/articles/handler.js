export default class ArticlesHandler {
  constructor(service) {
    this._service = service;

    this.getArticlesHandler = this.getArticlesHandler.bind(this);
    this.getArticleByIdHandler = this.getArticleByIdHandler.bind(this);
    this.postArticleHandler = this.postArticleHandler.bind(this);
    this.putArticleHandler = this.putArticleHandler.bind(this);
    this.deleteArticleHandler = this.deleteArticleHandler.bind(this);

    this.getCategoriesHandler = this.getCategoriesHandler.bind(this);
    this.postCategoryHandler = this.postCategoryHandler.bind(this);
    this.putCategoryHandler = this.putCategoryHandler.bind(this);
    this.deleteCategoryHandler = this.deleteCategoryHandler.bind(this);
  }

  async getArticlesHandler(request, h) {
    const result = await this._service.listArticles(request.query);
    return { status: "success", data: result.data, meta: result.meta };
  }

  async getArticleByIdHandler(request, h) {
    const { id } = request.params;
    const article = await this._service.getArticleById(id);
    return { status: "success", data: { article } };
  }

  async postArticleHandler(request, h) {
    const { id: author_id } = request.auth.credentials;
    const article = await this._service.createArticle(
      { ...request.payload, author_id },
      { cover_file: request.payload.cover_file }
    );
    return h
      .response({
        status: "success",
        message: "Artikel berhasil ditambahkan",
        data: { article },
      })
      .code(201);
  }

  async putArticleHandler(request, h) {
    const { id } = request.params;
    const article = await this._service.updateArticle(id, request.payload, {
      cover_file: request.payload.cover_file,
    });
    return {
      status: "success",
      message: "Artikel berhasil diperbarui",
      data: { article },
    };
  }

  async deleteArticleHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteArticle(id);
    return { status: "success", message: "Artikel berhasil dihapus" };
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
        message: "Kategori artikel dibuat",
        data: { category },
      })
      .code(201);
  }

  async putCategoryHandler(request, h) {
    const { id } = request.params;
    const category = await this._service.updateCategory(id, request.payload);
    return {
      status: "success",
      message: "Kategori artikel diupdate",
      data: { category },
    };
  }

  async deleteCategoryHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteCategory(id);
    return { status: "success", message: "Kategori artikel dihapus" };
  }
}
