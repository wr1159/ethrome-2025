import { existsSync } from "fs";

export function loadEnvFile() {
  if (existsSync(".env")) {
    process.loadEnvFile(".env");
  } else if (existsSync(`../../.env`)) {
    process.loadEnvFile(`../../.env`);
  }
}
