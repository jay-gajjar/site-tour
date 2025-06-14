import dts from "vite-plugin-dts";
import path from "path";
import { defineConfig, UserConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "reload",
      configureServer(server) {
        const { ws, watcher } = server;
        watcher.on("change", file => {
          if (file.endsWith(".html")) {
            ws.send({
              type: "full-reload",
            });
          }
        });
      },
    },
    dts({ rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/tour.ts"),
      name: "siteTour",
      formats: ["es", "cjs", "iife"],
      fileName: format => `site-tour.${format}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: "site-tour.css",
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
} satisfies UserConfig);
