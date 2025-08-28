"use strict";

import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import HapiAuthJwt2 from "hapi-auth-jwt2";
import AuthenticationError from "./exceptions/AuthenticationError.js";

// for auth
import auth from "./api/auth/index.js";
import AuthService from "./services/supabase/AuthService.js";
import AuthValidator from "./validator/auth/index.js";
import TokenManager from "./tokenize/TokenManager.js";

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

  await server.register(HapiAuthJwt2);

  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET,
    validate: async (decoded, request, h) => {
      if (request.route.path.startsWith("/admin") && decoded.role !== "admin") {
        return {
          isValid: false,
        };
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
      validator: AuthValidator,
    },
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
