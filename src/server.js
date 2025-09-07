"use strict";

import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import HapiAuthJwt2 from "hapi-auth-jwt2";
import TokenManager from "./tokenize/TokenManager.js";
import ClientError from "./exceptions/ClientError.js";

// for auth
import auth from "./api/auth/index.js";
import AuthService from "./services/supabase/AuthService.js";

// for admin-auth
import adminAuth from "./api/admin-auth/index.js";
import AdminAuthService from "./services/supabase/AdminAuthService.js";

dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  const authService = new AuthService();
  const adminAuthService = new AdminAuthService();

  await server.register(HapiAuthJwt2);

  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET,
    validate: async (decoded, request, h) => {
      if (
        request.route.path.startsWith("/admin") &&
        decoded.role !== "super_admin"
      ) {
        return { isValid: false };
      }

      const user = await authService._getUserProfile(decoded.id);
      if (!user || !user.is_active) {
        return {
          isValid: false,
        };
      }

      return {
        isValid: true,
        credentials: decoded,
      };
    },
  });

  await server.register({
    plugin: auth,
    options: {
      service: authService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: adminAuth,
    options: {
      service: adminAuthService,
      tokenManager: TokenManager,
    },
  });

  server.ext("onPreResponse", (request, h) => {
    const response = request.response;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return h
          .response({
            status: "fail",
            message: response.message,
          })
          .code(response.statusCode);
      }

      if (response.isBoom) {
        return h
          .response({
            status: "error",
            message: response.output.payload.message || "terjadi kegagalan",
          })
          .code(response.output.statusCode);
      }

      return h
        .response({
          status: "error",
          message: "terjadi kegagalan pada server kami",
        })
        .code(500);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
