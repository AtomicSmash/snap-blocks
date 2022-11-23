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
	isMultiple: {
		type: "boolean";
	};
	accordionGroupId: {
		type: "string";
	};
} = {
	isMultiple: {
		type: "boolean",
	},
	accordionGroupId: {
		type: "string",
	},
};
export type Attributes = typeof attributes;
export type InterpretedAttributes = {
	isMultiple: boolean;
	accordionGroupId: string;
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
