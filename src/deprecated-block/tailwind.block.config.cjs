/** @type {import('tailwindcss').Config} */
const tailwindConfig = require("../../tailwind.config.cjs");
module.exports = {
	content: ["./**/save.{js,ts,jsx,tsx}"],
	...tailwindConfig,
};
