import type { InterpretedAttributes as NewInterpretedAttributes } from "../v2/index";
import { createBlock } from "@wordpress/blocks";
import { omit } from "lodash";
import {
	BlockIsDeprecationEligibleFunction,
	BlockMigrateDeprecationFunction,
} from "../../../../wordpressBlockDefinitions";
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

/**
 * Deprecation migration function.
 *
 * This function dictates to WordPress how to update the block to the latest version.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/ The WordPress documentation}
 */
const migrate: BlockMigrateDeprecationFunction<
	InterpretedAttributes,
	NewInterpretedAttributes
> = (attributes) => {
	return [
		omit(attributes, "url"),
		[
			createBlock("core/image", {
				sizeSlug: "large",
				url: attributes.url,
			}),
		],
	];
};

/**
 * Deprecation isEligible function.
 *
 * This function is particularly useful in cases where a block is technically valid even once deprecated,
 * but still requires updates to its attributes or inner blocks.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/ The WordPress documentation}
 */
const isEligible: BlockIsDeprecationEligibleFunction<InterpretedAttributes> = ({
	url,
}) => {
	return url !== undefined;
};

export default {
	attributes,
	supports,
	migrate,
	isEligible,
	edit,
	save,
};
