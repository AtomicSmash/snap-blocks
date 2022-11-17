import { readdir } from "node:fs/promises";
import DependencyExtractionWebpackPlugin from "@wordpress/dependency-extraction-webpack-plugin";
import defaultConfig from "@wordpress/scripts/config/webpack.config.js";

const isProduction = process.env.NODE_ENV === "production";

function toCamelCase(text) {
	return text.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
		if (p2) return p2.toUpperCase();
		return p1.toLowerCase();
	});
}

async function getAllBlocksJSEntryPoints() {
	let entryPoints = {
		wordpressBlockDefinitions: {
			import: "./src/wordpressBlockDefinitions.ts",
			filename: "wordpressBlockDefinitions.[contenthash].js",
		},
	};
	const blockFolders = await readdir("./src", { withFileTypes: true }).then(
		(srcDirFiles) => {
			return srcDirFiles
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => dirent.name);
		}
	);
	for (let block of blockFolders) {
		const blockFiles = await readdir(`./src/${block}`, {
			withFileTypes: true,
		}).then((blockDirFiles) => {
			return blockDirFiles
				.filter((file) => !file.isDirectory())
				.map((file) => file.name)
				.filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
		});
		for (let blockJSFile of blockFiles) {
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
				import: `./src/${block}/${blockJSFile}`,
				filename: `${block}/${filename}${
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
	entry: getAllBlocksJSEntryPoints(),
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

export default config;
