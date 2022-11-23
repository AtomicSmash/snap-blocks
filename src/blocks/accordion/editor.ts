import { registerBlockType, registerSnapBlocksCollection } from "~/helpers";
import blockMetaData from "./block.json";
import v1, { Attributes, InterpretedAttributes } from "./versions/v1";

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType<Attributes, InterpretedAttributes>(blockMetaData.name, {
	...v1,
});
registerSnapBlocksCollection();
