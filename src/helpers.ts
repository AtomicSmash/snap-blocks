import { registerBlockCollection } from "@wordpress/blocks";
import { ASCircleLogo } from "./svgs";

export function registerSnapBlocksCollection() {
	registerBlockCollection("snap-blocks", {
		title: "Snap blocks",
		icon: ASCircleLogo,
	});
}
