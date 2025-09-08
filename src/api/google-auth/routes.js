import * as GoogleSchemas from "../../validator/google-auth/schema.js";

const routes = (handler) => [
  {
    method: "POST",
    path: "/auth/google",
    handler: handler.postGoogleAuthHandler,
    options: {
      description: "Login user dengan Google ID Token",
      tags: ["api", "auth"],
      validate: { payload: GoogleSchemas.GoogleAuthPayloadSchema },
    },
  },
];

export default routes;
