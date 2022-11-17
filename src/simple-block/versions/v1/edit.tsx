import type { InterpretedAttributes } from "./index";
import type { BlockEditProps } from "@wordpress/blocks";
import type { WPElement } from "@wordpress/element";
import {
	useBlockProps,
	RichText,
	AlignmentToolbar,
	BlockControls,
	InspectorControls,
} from "@wordpress/block-editor";
import {
	TextControl,
	SelectControl,
	Panel,
	PanelBody,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export function edit({
	attributes,
	setAttributes,
}: BlockEditProps<InterpretedAttributes>): WPElement {
	const { title, url, align, size } = attributes;
	const blockProps = useBlockProps({ className: `align-${align}` });

	return (
		<>
			<BlockControls>
				<AlignmentToolbar
					value={align}
					onChange={(newAlign: InterpretedAttributes["align"]) => {
						setAttributes({
							align: newAlign === undefined ? "none" : newAlign,
						});
					}}
				/>
			</BlockControls>
			<InspectorControls>
				<Panel>
					<PanelBody title="Block settings">
						<SelectControl<InterpretedAttributes["size"]>
							label="Block size"
							value={size}
							options={[
								{
									label: "Small",
									value: "small",
								},
								{
									label: "Large",
									value: "large",
								},
							]}
							onChange={(newSize: InterpretedAttributes["size"]) => {
								setAttributes({
									size: newSize,
								});
							}}
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>
			<div {...blockProps}>
				<RichText
					tagName="h2"
					onChange={(newTitle: InterpretedAttributes["title"]) => {
						setAttributes({ title: newTitle });
					}}
					allowedFormats={["core/bold", "core/italic"]}
					value={title}
					placeholder={__("Write your title...")}
				/>
				<TextControl
					label="Image URL"
					help="Enter an image URL here to display it on the front end."
					value={url}
					onChange={(newImageURL: InterpretedAttributes["url"]) => {
						setAttributes({ url: newImageURL });
					}}
				/>
			</div>
		</>
	);
}
