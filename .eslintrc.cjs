module.exports = {
	root: true,
	extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
	plugins: ["node"],
	env: {
		node: true,
	},
	rules: {
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
	},
	ignorePatterns: ["src/**/*.test.ts", "build/**/*"],
	overrides: [
		{
			files: ["**/*.ts", "**/*.tsx"],
			parser: "@typescript-eslint/parser",
			plugins: ["@typescript-eslint"],
			extends: [
				"plugin:@typescript-eslint/recommended",
				"plugin:@typescript-eslint/recommended-requiring-type-checking",
				"plugin:import/typescript",
			],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ["./tsconfig.json"],
			},
			rules: {
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
