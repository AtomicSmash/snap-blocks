/** @type {import('tailwindcss').Config} */
const tailwindConfig = require("../../../tailwind.config.cjs");
module.exports = {
	content: ["./**/edit.{js,ts,jsx,tsx}"],
	...tailwindConfig,
};
