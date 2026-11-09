import { createApp } from "./app.js";
import { readConfig } from "./config.js";

const app = createApp();

try {
  await app.listen(readConfig());
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
