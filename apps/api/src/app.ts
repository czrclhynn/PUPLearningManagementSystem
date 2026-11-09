import Fastify from "fastify";
import { registerHealthRoutes } from "./modules/health/routes.js";

export function createApp() {
  const app = Fastify({ logger: false });
  app.register(registerHealthRoutes);
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(500).send({ error: "Internal Server Error" });
  });
  return app;
}
