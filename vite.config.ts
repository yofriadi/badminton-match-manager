import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  const useCloudflareRuntime =
    command === "build" || process.env.CLOUDFLARE_DEV === "true";

  return {
    server: {
      host: "127.0.0.1",
      port: 3000,
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      ...(useCloudflareRuntime
        ? [cloudflare({ viteEnvironment: { name: "ssr" } })]
        : []),
      tanstackStart(),
      viteReact(),
    ],
  };
});
