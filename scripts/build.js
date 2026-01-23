const path = require("path");
const fs = require("fs-extra");
const { gzipSync } = require('zlib');
const margv = require("margv");
const rollup = require("rollup");
const {default:esbuild}  = require("rollup-plugin-esbuild");
const {default:dts} = require("rollup-plugin-dts");
const aliasPlugin = require("@rollup/plugin-alias");
const chalk = require("chalk");
const pkg = require("../package.json");
const {OutputOptions} = require("rollup");
const args = margv();

const root = args.dev
    ? path.resolve("./node_modules/vite-ssr-vue")
    : path.resolve("./dist");

// eslint-disable-next-line no-console
const log = console.log;
const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...["path", "fs"]
];
// console.log(root);

(async() => {
    log(chalk.green.bold("Start build bundle"));
    await fs.remove(root);
    log("Remove dist dir");
    await fs.mkdirp(root);
    await fs.copy("./LICENSE", path.resolve(root, "./LICENSE"));
    await fs.copy("./package.json", path.resolve(root, "./package.json"));
    await fs.copy("./README.md", path.resolve(root, "./README.md"));
    const pkg = await fs.readJson(path.resolve(root, "./package.json"));
    pkg.private = false;
    await fs.writeJson(path.resolve(root, "./package.json"), pkg, {
        spaces: 2
    });
    log("Copy files to dist dir");
    await buildWrappers("./src/plugin.ts", path.resolve(root, "./plugin/index.js"), {
        format: "cjs",
        exports: "auto"
    });
    await buildWrappers("./src/plugin.ts", path.resolve(root, "./plugin/index.mjs"), {
        format: "esm"
    });
    log("Build plugin");
    await buildWrappers("./src/vue/client.ts", path.resolve(root, "./client/index.mjs"));
    await buildWrappers("./src/vue/server.ts", path.resolve(root, "./server/index.mjs"));
    log("Build wrappers");
    for(const inputFile of [
        ["./src/plugin.ts", path.resolve(root, "./plugin/index.d.ts"), path.resolve(root, "./plugin/package.json")],
        ["./src/vue/client.ts", path.resolve(root, "./client/index.d.ts"), path.resolve(root, "./client/package.json")],
        ["./src/vue/server.ts", path.resolve(root, "./server/index.d.ts"), path.resolve(root, "./server/package.json")]
    ]) {
        await buildTypes(inputFile[0], inputFile[1]);
        await fs.writeJson(inputFile[2], {
            "main": "./index.js",
            "module": "./index.mjs",
            "types": "./index.d.ts"
        }, {
            spaces: 2
        });
    }
    log("Build types");
    log(chalk.green.bold("Build success"));
    await checkFileSize("./dist/client.js");
})();

const buildWrappers = async(input, output, write = {}) => {
    const bundle = await rollup.rollup({
        input: input, // ["./src/vue/client.ts", "./src/vue/server.ts"],
        external,
        plugins: [
            aliasPlugin({
                entries: [
                    { find:/^@\/(.*)/, replacement: path.resolve('./src/$1.ts') }
                ]
            }),
            esbuild({
                tsconfig: "./tsconfig.json"
            })
        ],
    });
    await bundle.write({
        format: "esm",
        file: output,
        ...write,
    });
    await bundle.close();
};

const buildTypes = async(input, output) => {
    const bundle = await rollup.rollup({
        input,
        external,
        plugins: [
            aliasPlugin({
                entries: [
                    { find:/^@\/(.*)/, replacement: path.resolve('./src/$1.ts') }
                ]
            }),
            dts()
        ]
    });
    await bundle.write({
        format: "esm",
        file: output,
    });
    await bundle.close();
};

const checkFileSize = async(filePath) => {

    if(!fs.existsSync(filePath)) {
        return;
    }
    const file = await fs.readFile(filePath);
    const minSize = (file.length / 1024).toFixed(2) + 'kb';
    const gzipped = gzipSync(file);
    const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';

    log(
        `${chalk.gray(
            chalk.bold(path.basename(filePath))
        )} min:${minSize} / gzip:${gzippedSize}`
    );
};