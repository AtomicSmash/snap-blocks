/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import {
	BlockIcon,
	registerBlockCollection,
	registerBlockType,
} from "@wordpress/blocks";

/**
 * Internal dependencies
 */
import v1 from "./versions/v1";
import looseMetadata from "./block.json";

const metadata = looseMetadata as typeof looseMetadata & {
	icon?: BlockIcon | undefined;
};

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType(metadata.name, {
	...metadata,
	...v1,
});
registerBlockCollection("snap-blocks", {
	title: "Snap blocks",
	icon: "smiley",
});
