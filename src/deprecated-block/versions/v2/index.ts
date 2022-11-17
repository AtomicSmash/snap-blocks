import { edit } from "./edit"; // Example of what to do if property has been updated in the new version.
import { save } from "./save";

/**
 * Block attributes.
 *
 * Block attributes provide information about the data stored by a block.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/ The WordPress documentation}
 */
export const attributes: {
	title: {
		type: "string";
	};
	size: {
		enum: ["small", "large"];
		default: "small";
	};
	align: {
		type: "string";
		default: "none";
	};
} = {
	title: {
		type: "string",
	},
	size: {
		enum: ["small", "large"],
		default: "small",
	},
	align: {
		type: "string",
		default: "none",
	},
};
export type Attributes = typeof attributes;
export type InterpretedAttributes = {
	title: string;
	size: "small" | "large";
	align: string;
};

/**
 * Block supports.
 *
 * Block Supports is the API that allows a block to declare support for certain features.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ The WordPress documentation}
 */
export const supports = {};
export type Supports = typeof supports;

export default {
	attributes,
	supports,
	edit,
	save,
};
