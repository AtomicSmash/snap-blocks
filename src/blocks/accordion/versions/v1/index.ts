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
	isInitiallyOpen: {
		type: "boolean";
		default: false;
	};
	accordionId: {
		type: "string";
	};
	headerContent: {
		type: "string";
	};
	headerElement: {
		enum: ["h2", "h3", "h4", "h5", "h6", "p"];
		default: "h2";
	};
} = {
	isInitiallyOpen: {
		type: "boolean",
		default: false,
	},
	accordionId: {
		type: "string",
	},
	headerContent: {
		type: "string",
	},
	headerElement: {
		enum: ["h2", "h3", "h4", "h5", "h6", "p"],
		default: "h2",
	},
};
export type Attributes = typeof attributes;
export type InterpretedAttributes = {
	isInitiallyOpen: boolean;
	accordionId: string;
	headerContent: string;
	headerElement: "h2" | "h3" | "h4" | "h5" | "h6" | "p";
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