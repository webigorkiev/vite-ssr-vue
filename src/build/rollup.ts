import { build, InlineConfig, mergeConfig, ResolvedConfig } from "vite";
import replace from "@rollup/plugin-replace";
import { promises as fs } from "fs";
import path from "path";
import { buildHtml } from "@/utils/buildHtml";
import type { RollupOutput, OutputAsset } from "rollup";
import type {PluginOptionsInternal} from "@/types";
import {entryFromTemplate} from "@/utils/entryFromTemplate";

type BuildOptions = {
  clientOptions?: InlineConfig
  serverOptions?: InlineConfig & { packageJson?: Record<string, unknown> }
}

export const rollupBuild = async(
    config: ResolvedConfig,
    options: PluginOptionsInternal,
    {
      clientOptions = {},
      serverOptions = {},
    }: BuildOptions = {}
) => {

  // Client build
  const clientBuildOptions = mergeConfig(
    {
      build: {
        isBuild: true,
        outDir: path.resolve(config.root, "dist/client"),
        ssrManifest: true,
      },
    },
    clientOptions
  ) as NonNullable<BuildOptions["clientOptions"]>;
  const clientResult = (await build(clientBuildOptions)) as RollupOutput;
  const indexHtml = clientResult.output.find(
    (file) => file.type === "asset" && file.fileName === "index.html"
  ) as OutputAsset;

  // -- SSR build
  const entry = options.ssr || await entryFromTemplate(
      await fs.readFile(path.resolve(config.root, "index.html"), "utf-8")
  );

  if(!entry) {
    throw new Error("Entry point not found");
  }
  const entryResolved = path.join(
      config.root,
      entry
  );

  // Create html template
  const html = buildHtml(
      indexHtml.source as string
  );

  const serverBuildOptions = mergeConfig(
    {
      build: {
        isBuild: true,
        outDir: path.resolve(config.root, "dist/server"),
        ssr: entryResolved,
        rollupOptions: {
          plugins: [
            replace({
              preventAssignment: true,
              values: {
                __VITE_SSR_VUE_HTML__: html,
              },
            }),
          ],
        },
      },
    },
    serverOptions
  ) as NonNullable<BuildOptions["serverOptions"]>;
  await build(serverBuildOptions);

  // Addition custom chunk
  if(options.custom) {
    const chunks = Object.keys(options.custom);
    for(const chunk of chunks) {
      const entryResolved = path.join(config.root, options.custom[chunk]);
      const buildOptions = mergeConfig({
        build: {
          isBuild: true,
          outDir: path.resolve(config.root, `dist/${chunk}`),
          ssr: entryResolved,
        }
      }, serverOptions) as NonNullable<BuildOptions["serverOptions"]>;
      await build(buildOptions);
    }
  }

  // Unlink index.html
  await fs
      .unlink(path.join(clientBuildOptions.build?.outDir as string, "index.html"))
      .catch(() => null);

  // package.json
  // @ts-ignore
  const type = serverBuildOptions.build?.rollupOptions?.output?.format === "es" ? "module" : "commonjs";
  const packageJson = {
    type,
    main: path.parse(serverBuildOptions.build?.ssr as string).name + ".js",
    ssr: {
      // This can be used later to serve static assets
      assets: (
        await fs.readdir(clientBuildOptions.build?.outDir as string)
      ).filter((file) => !/(index\.html|manifest\.json)$/i.test(file)),
    },
    ...(serverBuildOptions.packageJson || {}),
  };
  await fs.writeFile(
    path.join(serverBuildOptions.build?.outDir as string, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
};
