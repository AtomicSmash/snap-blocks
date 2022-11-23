import type { InterpretedAttributes } from "./index";
import type { WPElement } from "@wordpress/element";
import type { BlockSaveProps } from "~/helpers";
import { useBlockProps, InnerBlocks, RichText } from "@wordpress/block-editor";
import { DownArrow } from "~/svgs";

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
	const { isInitiallyOpen, accordionId, headerContent, headerElement } =
		attributes;
	const HeaderElement = headerElement;
	const blockProps = useBlockProps.save({
		"data-accordion": "",
		"data-is-initially-open": isInitiallyOpen,
		id: accordionId,
	});
	return (
		<div {...blockProps}>
			<HeaderElement>
				<button
					aria-expanded={"true"}
					aria-controls={`${accordionId}-panel`}
					data-state={"open"}
					id={`${accordionId}-trigger`}
					className="accordion-header-button"
				>
					<RichText.Content
						tagName={"span"}
						className={"accordion-header-button-text"}
						value={headerContent}
					/>
					<DownArrow className={"accordion-header-button-icon"} />
				</button>
			</HeaderElement>
			<div
				role="region"
				data-state="open"
				aria-labelledby={`${accordionId}-trigger`}
				id={`${accordionId}-panel`}
				className={"accordion-panel"}
			>
				<div className="accordion-panel-inner-wrapper">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
}
