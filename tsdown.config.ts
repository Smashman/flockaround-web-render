import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/main.ts"],
  deps: {
    alwaysBundle: "pixi.js",
  },
  format: "iife",
  outputOptions: {
    entryFileNames: "main.js",
  },
});
