import { edit } from "./edit"; // Example of what to do if property has been updated in the new version.
import { save } from "./save";
import { attributes, supports } from "../v2"; // Example of what to do if property is unchanged.

/**
 * Deprecation migration function.
 *
 * This function dictates to WordPress how to update the block to the latest version.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/ The WordPress documentation}
 */
const migrate = () => {
	return {};
};

/**
 * Deprecation isEligible function.
 *
 * This function is particularly useful in cases where a block is technically valid even once deprecated,
 * but still requires updates to its attributes or inner blocks.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/ The WordPress documentation}
 */
const isEligible = () => {
	return false;
};

export default {
	attributes,
	supports,
	migrate,
	isEligible,
	edit,
	save,
};
