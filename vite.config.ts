import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import UnocssPlugin from "@unocss/vite";

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
 plugins: [solidPlugin(), UnocssPlugin()],
 base: "/Internet-Anwendungen-fuer-mobile-Geraete/",
 server: {
  port: 3000,
 },
 build: {
  target: "esnext",
  rollupOptions: {
   input: {
    main: resolve(__dirname, "index.html"),
   },
  },
  copyPublicDir: true,
 },
 publicDir: "public",

 resolve: {
  alias: {
   "@": resolve(__dirname, "./src"),
  },
 },
});
