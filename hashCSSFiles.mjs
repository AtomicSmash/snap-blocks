import crypto from "crypto";
import { readFileSync, renameSync } from "node:fs";
import glob from "glob";
import { resolve } from "node:path";

glob(`${process.cwd()}/build/**/*.css`, {}, function (error, matches) {
	if (error) {
		throw error;
	}
	for (let match of matches) {
		const fileBuffer = readFileSync(match);
		const contentHash = crypto.createHash("shake256", { outputLength: 10 });
		contentHash.update(fileBuffer);
		const fileMatchArray = match.split("/");
		const newFileName = fileMatchArray
			.pop()
			.replace(".css", `.${contentHash.digest("hex")}.css`);

		renameSync(match, `${fileMatchArray.join("/")}/${newFileName}`);
	}
	return;
});

glob(
	`${resolve(
		process.cwd(),
		"../snap/public/wp-content/plugins/snap-blocks/build"
	)}/**/*.css`,
	{},
	function (error, matches) {
		if (error) {
			throw error;
		}
		for (let match of matches) {
			const fileBuffer = readFileSync(match);
			const contentHash = crypto.createHash("shake256", { outputLength: 10 });
			contentHash.update(fileBuffer);
			const fileMatchArray = match.split("/");
			const newFileName = fileMatchArray
				.pop()
				.replace(".css", `.${contentHash.digest("hex")}.css`);

			renameSync(match, `${fileMatchArray.join("/")}/${newFileName}`);
		}
		return;
	}
);
