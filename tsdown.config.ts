import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/main.ts"],
  platform: "browser",
  deps: {
    alwaysBundle: "pixi.js",
    onlyBundle: false,
  },
  format: "iife",
  outputOptions: {
    entryFileNames: "main.js",
  },
  copy: "src/style.css",
  loader: {
    ".vert": "text",
    ".frag": "text",
  },
});
