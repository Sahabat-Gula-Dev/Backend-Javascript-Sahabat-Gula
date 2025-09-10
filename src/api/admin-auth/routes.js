import * as AdminSchemas from "../../validator/admin-auth/schema.js";

const routes = (handler) => [
  {
    method: "POST",
    path: "/admin-auth/register-super-admin",
    handler: handler.postRegisterSuperAdminHandler,
    options: {
      description: "Register super admin (hanya sekali)",
      tags: ["api", "admin-auth"],
      validate: {
        payload: AdminSchemas.RegisterSuperAdminPayloadSchema,
      },
    },
  },
  {
    method: "POST",
    path: "/admin-auth/create-account",
    handler: handler.postCreateAccountHandler,
    options: {
      description: "Super admin membuat akun admin/user",
      tags: ["api", "admin-auth"],
      validate: { payload: AdminSchemas.CreateAccountPayloadSchema },
    },
  },
];

export default routes;
