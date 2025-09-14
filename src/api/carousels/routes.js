import * as CarouselSchemas from "../../validator/carousels/schema.js";

const routes = (handler) => [
  {
    method: "GET",
    path: "/carousels",
    handler: handler.getCarouselsHandler,
    options: {
      description: "Menampilkan daftar carousel",
      tags: ["api", "carousels"],
      validate: { query: CarouselSchemas.CarouselQuerySchema },
    },
  },
  {
    method: "GET",
    path: "/carousels/{id}",
    handler: handler.getCarouselByIdHandler,
    options: {
      description: "Menampilkan carousel berdasarkan ID",
      tags: ["api", "carousels"],
    },
  },
  {
    method: "POST",
    path: "/carousels",
    handler: handler.postCarouselHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan carousel baru",
      tags: ["api", "carousels"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024,
      },
      validate: { payload: CarouselSchemas.CarouselCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/carousels/{id}",
    handler: handler.putCarouselHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui carousel",
      tags: ["api", "carousels"],
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 5 * 1024 * 1024,
      },
      validate: { payload: CarouselSchemas.CarouselUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/carousels/{id}",
    handler: handler.deleteCarouselHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus carousel",
      tags: ["api", "carousels"],
    },
  },
];

export default routes;
