import { Edit } from "./edit"; // Example of what to do if property has been updated in the new version.
import { Save } from "./save";

/**
 * Block attributes.
 *
 * Block attributes provide information about the data stored by a block.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/ The WordPress documentation}
 */
export const attributes: {
	url: {
		type: "string";
		source: "attribute";
		selector: "img";
		attribute: "src";
	};
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
	url: {
		type: "string",
		source: "attribute",
		selector: "img",
		attribute: "src",
	},
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
	url: string;
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
	edit: Edit,
	save: Save,
};
