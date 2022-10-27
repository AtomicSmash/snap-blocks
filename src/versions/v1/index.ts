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
const migrate = () => {};

/**
 * Deprecation isEligible function.
 *
 * This function is particularly useful in cases where a block is technically valid even once deprecated,
 * but still requires updates to its attributes or inner blocks.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/ The WordPress documentation}
 */
const isEligible = () => {};

// Define stylesheet location relative to block.json.
export const style = [`file:./v2/styles.css`];
export const editorStyle = [`file:./v2/editor-styles.css`];

export default {
	attributes,
	supports,
	migrate,
	isEligible,
	edit,
	save,
	style,
	editorStyle,
};
