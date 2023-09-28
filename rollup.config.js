import glob from "fast-glob"
import { defineConfig } from "rollup"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import { dts } from "rollup-plugin-dts"
import path from "node:path"
import { fileURLToPath } from "node:url"

const relativePath = (file) => [
  path.relative("src", file.slice(0, file.length - path.extname(file).length)),
  fileURLToPath(new URL(file, import.meta.url)),
]

const plugins = [resolve(), commonjs(), typescript()]

export default defineConfig([
  {
    input: Object.fromEntries(
      glob.sync("src/**/*.ts", { ignore: ["**/*/interface.ts"] }).map(relativePath),
    ),
    output: [
      {
        format: "es",
        dir: "esm",
        exports: "named",
      },
      {
        format: "es",
        dir: "lib",
        exports: "named",
      },
    ],
    plugins: [...plugins],
  },
  {
    input: Object.fromEntries(glob.sync("src/**/*.ts").map(relativePath)),
    output: [
      {
        format: "es",
        dir: "esm",
      },
      {
        format: "es",
        dir: "lib",
      },
    ],
    plugins: [...plugins, dts()],
  },
])
