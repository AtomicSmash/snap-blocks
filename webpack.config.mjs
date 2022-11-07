import defaultConfig from "@wordpress/scripts/config/webpack.config.js";
import DependencyExtractionWebpackPlugin from "@wordpress/dependency-extraction-webpack-plugin";
import { readdir } from "node:fs/promises";

const isProduction = process.env.NODE_ENV === "production";

function toCamelCase(text) {
	return text.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2, offset) {
		if (p2) return p2.toUpperCase();
		return p1.toLowerCase();
	});
}

async function getAllBlocksJSEntryPoints() {
	let entryPoints = {};
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
	console.log({ entryPoints });
	return entryPoints;
}

const config = {
	...defaultConfig,
	entry: await getAllBlocksJSEntryPoints(),
	plugins: [
		...(defaultConfig.plugins
			? defaultConfig.plugins.filter((plugin) => {
					return !(plugin instanceof DependencyExtractionWebpackPlugin);
			  })
			: []),
		new DependencyExtractionWebpackPlugin({
			combineAssets: true,
		}),
	],
};

export default config;
