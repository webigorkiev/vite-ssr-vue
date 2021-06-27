import { build, InlineConfig, mergeConfig, ResolvedConfig } from 'vite'
import replace from '@rollup/plugin-replace'
import { promises as fs } from 'fs'
import path from 'path'
import { buildHtml } from '../utils/buildHtml'
import type { RollupOutput, OutputAsset } from 'rollup'
import type {Options} from "../plugin";

type BuildOptions = {
  clientOptions?: InlineConfig
  serverOptions?: InlineConfig & { packageJson?: Record<string, unknown> }
}

export default async (
    config: ResolvedConfig,
    options: Options,
    {
      clientOptions = {},
      serverOptions = {},
    }: BuildOptions = {}
) => {

  // Client build
  console.log("Client build", path.resolve(config.root, 'dist/client'));
  const clientBuildOptions = mergeConfig(
    {
      build: {
        isBuild: true,
        outDir: path.resolve(config.root, 'dist/client'),
        ssrManifest: true,
      },
    },
    clientOptions
  ) as NonNullable<BuildOptions['clientOptions']>
  const clientResult = (await build(clientBuildOptions)) as RollupOutput;
  const indexHtml = clientResult.output.find(
    (file) => file.type === 'asset' && file.fileName === 'index.html'
  ) as OutputAsset

  // -- SSR build
  console.log("SSR build", path.resolve(config.root, 'dist/server'));
  const serverBuildOptions = mergeConfig(
    {
      build: {
        isBuild: true,
        outDir: path.resolve(config.root, 'dist/server'),
        ssr: path.join(config.root, options.ssr),
        rollupOptions: {
          plugins: [
            replace({
              preventAssignment: true,
              values: {
                __VITE_SSR_HTML__: buildHtml(
                  indexHtml.source as string
                ),
              },
            }),
          ],
        },
      },
    },
    serverOptions
  ) as NonNullable<BuildOptions['serverOptions']>
  await build(serverBuildOptions);

  // --- Generate package.json
  const type =
    // @ts-ignore
    serverBuildOptions.build?.rollupOptions?.output?.format === 'es'
      ? 'module'
      : 'commonjs'

  // index.html is not used in SSR and might be served by mistake
  await fs
    .unlink(path.join(clientBuildOptions.build?.outDir as string, 'index.html'))
    .catch(() => null)

  const packageJson = {
    type,
    main: path.parse(serverBuildOptions.build?.ssr as string).name + '.js',
    ssr: {
      // This can be used later to serve static assets
      assets: (
        await fs.readdir(clientBuildOptions.build?.outDir as string)
      ).filter((file) => !/(index\.html|manifest\.json)$/i.test(file)),
    },
    ...(serverBuildOptions.packageJson || {}),
  }

  await fs.writeFile(
    path.join(serverBuildOptions.build?.outDir as string, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )
}
