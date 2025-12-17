import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),          // root of front-end
      "@/lib": path.resolve(__dirname, "lib"),
      "@/data": path.resolve(__dirname, "data"),
    },
  },
});
