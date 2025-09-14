import * as InformationSchemas from "../../validator/informations/schema.js";

const routes = (handler) => [
  {
    method: "GET",
    path: "/informations",
    handler: handler.getRandomInformationHandler,
    options: {
      description: "Menampilkan satu information secara acak",
      tags: ["api", "informations"],
    },
  },
  {
    method: "GET",
    path: "/informations/{id}",
    handler: handler.getInformationByIdHandler,
    options: {
      description: "Menampilkan information berdasarkan ID",
      tags: ["api", "informations"],
    },
  },
  {
    method: "POST",
    path: "/informations",
    handler: handler.postInformationHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan information baru",
      tags: ["api", "informations"],
      validate: { payload: InformationSchemas.InformationCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/informations/{id}",
    handler: handler.putInformationHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui information",
      tags: ["api", "informations"],
      validate: { payload: InformationSchemas.InformationUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/informations/{id}",
    handler: handler.deleteInformationHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus information",
      tags: ["api", "informations"],
    },
  },
];

export default routes;
