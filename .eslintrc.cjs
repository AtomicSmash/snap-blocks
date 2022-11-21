const commonRules = {
	"import/order": [
		"error",
		{
			alphabetize: {
				order: "asc",
			},
			groups: [
				"type",
				"builtin",
				"external",
				"internal",
				"parent",
				["sibling", "index"],
			],
			"newlines-between": "ignore",
			pathGroups: [],
			pathGroupsExcludedImportTypes: [],
		},
	],
	"import/no-duplicates": "warn",
	"no-console": ["warn", { allow: ["warn", "error"] }],
};

module.exports = {
	root: true,
	ignorePatterns: ["node_modules/**/*", "build/**/*"],
	settings: {
		"import/resolver": {
			node: {
				extensions: [".js", ".jsx", ".ts", ".tsx"],
			},
			typescript: {
				alwaysTryTypes: true,
			},
		},
		"import/parsers": {
			["@typescript-eslint/parser"]: [".ts", ".tsx", ".d.ts"],
		},
	},
	overrides: [
		{
			files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
			extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
			plugins: ["import", "node"],
			env: {
				browser: true,
				commonjs: true,
				es6: true,
				node: true,
			},
			rules: commonRules,
		},
		{
			files: ["**/*.ts", "**/*.tsx"],
			parser: "@typescript-eslint/parser",
			plugins: ["node", "@typescript-eslint"],
			env: {
				browser: true,
				commonjs: true,
				es6: true,
				node: true,
			},
			extends: [
				"eslint:recommended",
				"plugin:import/recommended",
				"plugin:@typescript-eslint/recommended",
				"plugin:@typescript-eslint/recommended-requiring-type-checking",
				"plugin:import/typescript",
				"prettier",
			],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ["./tsconfig.json"],
			},
			rules: {
				...commonRules,
				"@typescript-eslint/strict-boolean-expressions": [
					2,
					{
						allowString: false,
						allowNumber: false,
					},
				],
			},
		},
	],
};
