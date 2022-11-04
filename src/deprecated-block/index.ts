/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockCollection, registerBlockType } from "@wordpress/blocks";

/**
 * Internal dependencies
 */
import v1 from "./versions/v1";
import v2 from "./versions/v2";
import "./style.css";
import "./editor-styles.css";
import metadata from "./block.json";

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType(metadata, {
	...v2,
	deprecated: [v2, v1],
});
registerBlockCollection("snap-blocks", {
	title: "Snap blocks",
	icon: "smiley",
});
