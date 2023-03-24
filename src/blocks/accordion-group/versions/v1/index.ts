import {
	BlockAttributes,
	BlockSupports,
	InterpretAttributes,
} from "@atomicsmash/blocks-helpers";
import { Edit } from "./edit"; // Example of what to do if property has been updated in the new version.
import { Save } from "./save";

/**
 * Block attributes.
 *
 * Block attributes provide information about the data stored by a block.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/ The WordPress documentation}
 */
export const attributes = {
	isMultiple: {
		type: "boolean",
		default: false,
	},
	accordionGroupId: {
		type: "string",
	},
} as const satisfies BlockAttributes;
export type Attributes = typeof attributes;
export type InterpretedAttributes = InterpretAttributes<Attributes>;

/**
 * Block supports.
 *
 * Block Supports is the API that allows a block to declare support for certain features.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ The WordPress documentation}
 */
export const supports = {} as const satisfies BlockSupports;
export type Supports = typeof supports;

export default {
	attributes,
	supports,
	edit: Edit,
	save: Save,
};
