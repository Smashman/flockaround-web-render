import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/main.ts"],
  deps: {
    alwaysBundle: "pixi.js",
    onlyBundle: false,
  },
  format: "iife",
  outputOptions: {
    entryFileNames: "main.js",
  },
  loader: {
    ".vert": "text",
    ".frag": "text",
  },
});
