import * as ProfileSchemas from "../../validator/profile/schema.js";

const routes = (handler) => [
  {
    method: "POST",
    path: "/setup",
    handler: handler.postSetupProfileHandler,
    options: {
      auth: "jwt",
      description: "Setup atau perbarui profil pengguna",
      tags: ["api", "profiles"],
      validate: {
        payload: ProfileSchemas.ProfileSetupSchema,
      },
    },
  },
  {
    method: "GET",
    path: "/me",
    handler: handler.getMyProfileSetupHandler,
    options: {
      auth: "jwt",
      description: "Ambil profile user sendiri",
      tags: ["api", "profiles"],
    },
  },
];

export default routes;
