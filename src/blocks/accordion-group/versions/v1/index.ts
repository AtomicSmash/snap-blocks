import type {
	BlockAttributes,
	BlockSupports,
	BlockExample,
	InterpretAttributes,
} from "@atomicsmash/blocks-helpers";
import { Edit } from "./edit"; // Example of what to do if property has been updated in the new version.
import { Save } from "./save";

/**
 * Block attributes.
 *
 * Block attributes provide information about the data stored by a block.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/ The WordPress documentation}
 */
export const attributes = {
	isMultiple: {
		type: "boolean",
		default: false,
	},
	accordionGroupId: {
		type: "string",
	},
} as const satisfies BlockAttributes;
export type Attributes = typeof attributes;
export type InterpretedAttributes = InterpretAttributes<Attributes>;

/**
 * Block supports.
 *
 * Block Supports is the API that allows a block to declare support for certain features.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ The WordPress documentation}
 */
export const supports = {} as const satisfies BlockSupports;
export type Supports = typeof supports;

/**
 * Block example
 *
 * This is the content that WordPress will use to preview your block in various situations.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#example}
 */
export const example = {
	attributes: {
		isMultiple: true,
		accordionGroupId: "group-123",
	},
	innerBlocks: [
		{
			name: "snap-blocks/accordion",
			attributes: {
				isInitiallyOpen: true,
				accordionId: "single-123",
				headerContent: "Accordion title",
				headerElement: "h3",
			},
			innerBlocks: [
				{
					name: "core/paragraph",
					attributes: {
						content:
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et eros eu felis.",
					},
				},
			],
		},
		{
			name: "snap-blocks/accordion",
			attributes: {
				isInitiallyOpen: true,
				accordionId: "single-456",
				headerContent: "Accordion title",
				headerElement: "h3",
			},
			innerBlocks: [
				{
					name: "core/paragraph",
					attributes: {
						content:
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et eros eu felis.",
					},
				},
			],
		},
		{
			name: "snap-blocks/accordion",
			attributes: {
				isInitiallyOpen: true,
				accordionId: "single-789",
				headerContent: "Accordion title",
				headerElement: "h3",
			},
			innerBlocks: [
				{
					name: "core/paragraph",
					attributes: {
						content:
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et eros eu felis.",
					},
				},
			],
		},
	],
} satisfies BlockExample<InterpretedAttributes>;

export default {
	attributes,
	supports,
	example,
	edit: Edit,
	save: Save,
};
