import { exec } from "child_process";
import { readdir } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import DependencyExtractionWebpackPlugin from "@wordpress/dependency-extraction-webpack-plugin";
import defaultConfig from "@wordpress/scripts/config/webpack.config.js";

export async function execute(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject({ error, stdout, stderr });
			}
			resolve({ error, stdout, stderr });
		});
	});
}

const isProduction = process.env.NODE_ENV === "production";

function toCamelCase(text) {
	return text.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
		if (p2) return p2.toUpperCase();
		return p1.toLowerCase();
	});
}

async function getAllBlocksJSEntryPoints() {
	const entryPoints = {
		helpers: {
			import: "./src/helpers.ts",
			filename: `helpers${isProduction ? `.[contenthash]` : ""}.js`,
		},
	};
	const blockFolders = await readdir("./src/blocks", {
		withFileTypes: true,
	}).then((srcDirFiles) => {
		return srcDirFiles
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);
	});
	for (const block of blockFolders) {
		const blockFiles = await readdir(`./src/blocks/${block}`, {
			withFileTypes: true,
		}).then((blockDirFiles) => {
			return blockDirFiles
				.filter((file) => !file.isDirectory())
				.map((file) => file.name)
				.filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
		});
		for (const blockJSFile of blockFiles) {
			let blockBonusScriptNumber = 1;
			const [filename] = blockJSFile.split(".");
			let entryName;
			if (filename === "index") {
				entryName = block;
			} else if (filename === "editor") {
				entryName = `${block}-editor`;
			} else if (filename === "view") {
				entryName = `${block}-view`;
			} else {
				entryName = `${block}-bonus${blockBonusScriptNumber}`;
				blockBonusScriptNumber++;
			}
			entryPoints[toCamelCase(entryName)] = {
				import: `./src/blocks/${block}/${blockJSFile}`,
				filename: `blocks/${block}/${filename}${
					isProduction ? `.[contenthash]` : ""
				}.js`,
			};
		}
	}
	// eslint-disable-next-line no-console
	console.log({ entryPoints });
	return entryPoints;
}

const config = {
	...defaultConfig,
	entry: () => getAllBlocksJSEntryPoints(),
	plugins: [
		...defaultConfig.plugins.filter(
			(plugin) =>
				plugin.constructor.name !== "DependencyExtractionWebpackPlugin"
		),
		new DependencyExtractionWebpackPlugin({
			combineAssets: true,
		}),
	],
};

export default [
	{
		...config,
		output: {
			path: resolvePath(process.cwd(), "build"),
			clean: true,
		},
		plugins: [
			...config.plugins,
			{
				apply: (compiler) => {
					compiler.hooks.afterEmit.tapPromise(
						"Build CSS and copy to test area",
						async () => {
							return execute(
								"postcss src/blocks/**/*.css --base src --dir build"
							)
								.then(() => {
									if (!isProduction) {
										return;
									}
									execute("node scripts/hashCSSFiles.mjs").catch((error) => {
										console.error(error);
									});
								})
								.catch((error) => {
									console.error(error);
								});
						}
					);
				},
			},
		],
		resolve: {
			plugins: [new TsconfigPathsPlugin()],
			extensions: [".ts", ".js", ".tsx", ".jsx"],
		},
	},
];
