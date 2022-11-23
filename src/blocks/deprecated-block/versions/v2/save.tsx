import type { InterpretedAttributes } from "./index";
import type { WPElement } from "@wordpress/element";
import type { BlockSaveProps } from "~/helpers";
import { useBlockProps, RichText, InnerBlocks } from "@wordpress/block-editor";

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */
export function Save({
	attributes,
}: BlockSaveProps<InterpretedAttributes>): WPElement {
	const { title, align, size } = attributes;
	const blockProps = useBlockProps.save({
		className: `align-${align} blockSize-${size}`,
	});
	return (
		<div {...blockProps}>
			<RichText.Content tagName="h2" value={title} />
			<InnerBlocks.Content />
		</div>
	);
}
