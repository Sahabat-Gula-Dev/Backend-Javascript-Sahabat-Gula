import * as TipSchemas from "../../validator/tips/schema.js";

const routes = (handler) => [
  {
    method: "GET",
    path: "/tips",
    handler: handler.getRandomTipHandler,
    options: {
      description: "Menampilkan satu tips secara acak",
      tags: ["api", "tips"],
    },
  },
  {
    method: "GET",
    path: "/tips/{id}",
    handler: handler.getTipByIdHandler,
    options: {
      description: "Menampilkan tips berdasarkan ID",
      tags: ["api", "tips"],
    },
  },
  {
    method: "POST",
    path: "/tips",
    handler: handler.postTipHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menambahkan tips baru",
      tags: ["api", "tips"],
      validate: { payload: TipSchemas.TipCreateSchema },
    },
  },
  {
    method: "PUT",
    path: "/tips/{id}",
    handler: handler.putTipHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Memperbarui tips",
      tags: ["api", "tips"],
      validate: { payload: TipSchemas.TipUpdateSchema },
    },
  },
  {
    method: "DELETE",
    path: "/tips/{id}",
    handler: handler.deleteTipHandler,
    options: {
      auth: { strategy: "jwt", scope: ["super-admin", "admin"] },
      description: "Menghapus tips",
      tags: ["api", "tips"],
    },
  },
];

export default routes;
