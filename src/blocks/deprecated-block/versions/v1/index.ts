import type { InterpretedAttributes as NewInterpretedAttributes } from "../v2/index";
import {
	BlockIsDeprecationEligibleFunction,
	BlockMigrateDeprecationFunction,
	InterpretAttributes,
} from "@atomicsmash/blocks-helpers";
import { createBlock } from "@wordpress/blocks";
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
} as const;
export type Attributes = typeof attributes;
export type InterpretedAttributes = InterpretAttributes<Attributes>;

/**
 * Block supports.
 *
 * Block Supports is the API that allows a block to declare support for certain features.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ The WordPress documentation}
 */
export const supports = {} as const;
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
> = (migrateAttributes) => {
	const { url, ...rest } = migrateAttributes;
	return [
		rest,
		[
			createBlock("core/image", {
				sizeSlug: "large",
				url,
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
	edit: Edit,
	save: Save,
};

/*
Code output of v1 for testing purposes.
<!-- wp:snap-blocks/deprecated-block {"title":"This is a \u003cstrong\u003eblock\u003c/strong\u003e to be \u003cem\u003emigrated\u003c/em\u003e"} -->
<div class="wp-block-snap-blocks-deprecated-block align-none blockSize-small"><h2>This is a <strong>block</strong> to be <em>migrated</em></h2><img src="https://placekitten.com/200/300" alt=""/></div>
<!-- /wp:snap-blocks/deprecated-block -->
*/
