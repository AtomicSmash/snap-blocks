module.exports = {
	extends: [
		"@atomicsmash/eslint-config",
		"plugin:@wordpress/eslint-plugin/recommended",
		"prettier",
	],
	rules: {
		"prettier/prettier": "off",
	},
	settings: {
		"import/resolver": {
			node: {
				extensions: [".js", ".jsx", ".ts", ".tsx"],
			},
			typescript: {
				alwaysTryTypes: true,
			},
		},
	},
	overrides: [
		{
			files: ["**/*.cjs"],
			env: {
				commonjs: true,
				es6: false,
			},
		},
		{
			files: ["**/*.ts", "**/*.tsx"],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ["./tsconfig.json"],
			},
			rules: {
				// Don't require redundant JSDoc types in TypeScript files.
				"jsdoc/require-param": "off",
				"jsdoc/require-param-type": "off",
				"jsdoc/require-returns-type": "off",
			},
		},
	],
};
