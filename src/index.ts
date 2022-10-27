/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from "@wordpress/blocks";

/**
 * Internal dependencies
 */
import v1 from "./versions/v1";
import v2 from "./versions/v2";
import metadata from "./block.json";

/**
 * Note: Register block type function type is currently out of date, and therefore throws an error when providing an array for style and editorStyle.
 * Due to us using this valid use case, we must tell typescript to expect the error.
 * TODO: Remove expect error once types are fixed in 3rd party package.
 */
/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
// @ts-expect-error
registerBlockType(metadata, {
	...v2,
	deprecated: [v2, v1],
});
