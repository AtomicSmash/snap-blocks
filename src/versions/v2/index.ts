import { edit } from "./edit";
import { save } from "./save";

/**
 * Block attributes.
 *
 * Block attributes provide information about the data stored by a block.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/ The WordPress documentation}
 */
export const attributes = {};

/**
 * Block supports.
 *
 * Block Supports is the API that allows a block to declare support for certain features.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ The WordPress documentation}
 */
export const supports = {};

// Define stylesheet location relative to block.json.
export const style = [`file:./v2/styles.css`];
export const editorStyle = [`file:./v2/editor-styles.css`];

export default {
	attributes,
	supports,
	edit,
	save,
	style,
	editorStyle,
};
