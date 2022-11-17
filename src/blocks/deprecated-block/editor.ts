import { registerBlockCollection } from "@wordpress/blocks";
import { registerBlockType } from "../../wordpressBlockDefinitions";
import blockMetaData from "./block.json";
import v1, {
	InterpretedAttributes as v1InterpretedAttributes,
} from "./versions/v1";
import v2, { Attributes, InterpretedAttributes } from "./versions/v2";

type AllPossibleAttributes = v1InterpretedAttributes & InterpretedAttributes;

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType<Attributes, InterpretedAttributes, AllPossibleAttributes>(
	blockMetaData.name,
	{
		...v2,
		deprecated: [v1],
	}
);
registerBlockCollection("snap-blocks", {
	title: "Snap blocks",
	icon: "smiley",
});
