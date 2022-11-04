import defaultConfig from "@wordpress/scripts/config/webpack.config.js";
import DependencyExtractionWebpackPlugin from "@wordpress/dependency-extraction-webpack-plugin";
import MiniCSSExtractPlugin from "mini-css-extract-plugin";
import { readdir } from "node:fs/promises";

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
				filename: `${block}/${filename}.[contenthash].min.js`,
			};
		}
	}
	console.log({ entryPoints });
	return entryPoints;
}

const config = {
	...defaultConfig,
	entry: await getAllBlocksJSEntryPoints(),
	output: {
		...defaultConfig.output,
		clean: true,
	},
	plugins: [
		...(defaultConfig.plugins
			? defaultConfig.plugins.filter((plugin) => {
					return !(
						plugin instanceof MiniCSSExtractPlugin ||
						plugin instanceof DependencyExtractionWebpackPlugin
					);
			  })
			: []),
		new MiniCSSExtractPlugin({
			filename: `[name].[contenthash].min.css`,
		}),
		new DependencyExtractionWebpackPlugin({
			combineAssets: true,
		}),
	],
};

export default config;
