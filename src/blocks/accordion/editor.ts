import {
	registerBlockType,
	registerSnapBlocksCollection,
} from "@atomicsmash/blocks-helpers";
import blockMetaData from "./block.json";
import v1, { Attributes } from "./versions/v1";

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType<Attributes>(blockMetaData.name, {
	...v1,
});
registerSnapBlocksCollection();