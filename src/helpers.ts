import { ASCircleLogo } from "@plugin/blocks/svgs";
import { registerBlockCollection } from "@wordpress/blocks";

export function registerSnapBlocksCollection() {
	registerBlockCollection("snap-blocks", {
		title: "Snap blocks",
		icon: ASCircleLogo,
	});
}
