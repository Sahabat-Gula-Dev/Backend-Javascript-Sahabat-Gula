"use strict";

import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import auth from "./api/auth/index.js";
import AuthService from "./services/supabase/AuthService.js";
import TokenManager from "./tokenize/TokenManager.js";
import HapiAuthJwt2 from "hapi-auth-jwt2";
import AuthenticationError from "./exceptions/AuthenticationError.js";
import InvariantError from "./exceptions/InvariantError.js";

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

  await server.register(HapiAuthJwt2);

  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET,
    validate: (artifacts, request, h) => {
      try {
        const payload = TokenManager.verifyAccessToken(artifacts.token);
        const isUserAdmin = payload.role === "admin";
        if (request.route.path.startsWith("/admin") && !isUserAdmin) {
          throw new AuthenticationError(
            "You are not authorized to access this resource"
          );
        }
        return { isValid: true, credentials: payload };
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return { isValid: false, error: error.message };
        }
        return { isValid: false, error: "Invalid token" };
      }
    },
  });

  const authService = new AuthService();

  await server.register({
    plugin: auth,
    options: {
      service: authService,
      tokenManager: TokenManager,
    },
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
