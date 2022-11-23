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
	"prettier/prettier": "off",
};

const sharedExtends = [
	"eslint:recommended",
	"plugin:import/recommended",
	"plugin:@wordpress/eslint-plugin/recommended",
];

module.exports = {
	root: true,
	ignorePatterns: [
		"node_modules/**/*",
		"build/**/*",
		"tailwind.config.cjs",
		"tailwind.*.config.cjs",
	],
	extends: [
		...sharedExtends,
		"prettier", // Not included in shared configs because it must always be last.
	],
	plugins: ["import", "node"],
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	rules: commonRules,
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
			parser: "@typescript-eslint/parser",
			plugins: ["@typescript-eslint"],
			extends: [
				"plugin:@typescript-eslint/recommended",
				"plugin:@typescript-eslint/recommended-requiring-type-checking",
				"plugin:import/typescript",
				"prettier", // Not included in shared configs because it must always be last.
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
				// Don't require redundant JSDoc types in TypeScript files.
				"jsdoc/require-param": "off",
				"jsdoc/require-param-type": "off",
				"jsdoc/require-returns-type": "off",
			},
		},
	],
};
