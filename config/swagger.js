import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerJsdoc from "swagger-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerPath = path.resolve(
  __dirname,
  "../module/recovery-emi/controller/recovery.controller.js"
);

console.log("Exists:", fs.existsSync(controllerPath));
console.log("Path:", controllerPath);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FinSarthi API",
      version: "1.0.0",
    },
  },
  apis: [controllerPath],
};

const spec = swaggerJsdoc(options);

console.log(spec.paths);

export default spec;