import type { InterpretedAttributes } from "./index";
import type { BlockEditProps } from "@atomicsmash/blocks-helpers";
import type { WPElement } from "@wordpress/element";
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	InnerBlocks,
	RichText,
	Inserter,
} from "@wordpress/block-editor";
import {
	CheckboxControl,
	Panel,
	PanelBody,
	DropdownMenu,
	Path,
	SVG,
	ToolbarGroup,
	ButtonGroup,
	Button,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { DownArrow } from "~/svgs";
import { attributes as definedAttributeOptions } from "./index";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export function Edit({
	clientId,
	attributes,
	setAttributes,
}: BlockEditProps<InterpretedAttributes>): WPElement {
	const { isInitiallyOpen, headerContent, headerElement } = attributes;
	const HeaderElement = headerElement;
	const blockProps = useBlockProps();
	setAttributes({ accordionId: clientId });

	return (
		<>
			<InspectorControls>
				<Panel>
					<PanelBody title="Block settings">
						<CheckboxControl
							label="Is accordion open by default?"
							help={`Allows you to set the initial state for the accordion. If only one accordion is allowed to be open at a time in the group, this setting will only apply to the first accordion.`}
							checked={isInitiallyOpen}
							onChange={(isInputChecked) => {
								setAttributes({ isInitiallyOpen: isInputChecked });
							}}
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>
			<BlockControls>
				<ToolbarGroup>
					<DropdownMenu
						popoverProps={{ className: "accordion-heading-element-dropdown" }}
						icon={<HeadingElementIcon elementType={headerElement} />}
						label={__("Change title heading element", "snap-blocks")}
						controls={definedAttributeOptions.headerElement.enum.map(
							(targetLevel) => {
								{
									const isActive = targetLevel === headerElement;

									return {
										icon: <HeadingElementIcon elementType={targetLevel} />,
										title: getHumanNameOfElement(targetLevel),
										isDisabled: isActive,
										onClick: () =>
											setAttributes({ headerElement: targetLevel }),
										role: "menuitemradio",
									};
								}
							}
						)}
					/>
				</ToolbarGroup>
			</BlockControls>
			<div {...blockProps}>
				<HeaderElement>
					<div className="accordion-header-button">
						<RichText
							tagName={"span"}
							className={"accordion-header-button-text"}
							onChange={(newHeaderContent) => {
								setAttributes({ headerContent: newHeaderContent });
							}}
							value={headerContent}
							allowedFormats={[
								"core/bold",
								"core/code",
								"core/italic",
								"core/keyboard",
								"core/strikethrough",
								"core/subscript",
								"core/superscript",
								"core/underline",
							]}
							placeholder={__("Write your accordion header…", "snap-blocks")}
						/>
						<DownArrow className={"accordion-header-button-icon"} />
					</div>
				</HeaderElement>
				<div className={"accordion-panel"}>
					<div className="accordion-panel-inner-wrapper">
						<InnerBlocks
							renderAppender={() => (
								<MyButtonBlockAppender rootClientId={clientId} />
							)}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

function getHumanNameOfElement(
	element: InterpretedAttributes["headerElement"]
) {
	switch (element) {
		case "h2":
			return __("Heading 2", "snap-blocks");
		case "h3":
			return __("Heading 3", "snap-blocks");
		case "h4":
			return __("Heading 4", "snap-blocks");
		case "h5":
			return __("Heading 5", "snap-blocks");
		case "h6":
			return __("Heading 6", "snap-blocks");
		case "p":
			return __("Paragraph", "snap-blocks");
	}
}

function HeadingElementIcon({
	elementType,
}: {
	elementType: InterpretedAttributes["headerElement"];
}) {
	const elementTypeToPath = {
		h2: "M7 5h2v10H7v-4H3v4H1V5h2v4h4V5zm8 8c.5-.4.6-.6 1.1-1.1.4-.4.8-.8 1.2-1.3.3-.4.6-.8.9-1.3.2-.4.3-.8.3-1.3 0-.4-.1-.9-.3-1.3-.2-.4-.4-.7-.8-1-.3-.3-.7-.5-1.2-.6-.5-.2-1-.2-1.5-.2-.4 0-.7 0-1.1.1-.3.1-.7.2-1 .3-.3.1-.6.3-.9.5-.3.2-.6.4-.8.7l1.2 1.2c.3-.3.6-.5 1-.7.4-.2.7-.3 1.2-.3s.9.1 1.3.4c.3.3.5.7.5 1.1 0 .4-.1.8-.4 1.1-.3.5-.6.9-1 1.2-.4.4-1 .9-1.6 1.4-.6.5-1.4 1.1-2.2 1.6V15h8v-2H15z",
		h3: "M12.1 12.2c.4.3.8.5 1.2.7.4.2.9.3 1.4.3.5 0 1-.1 1.4-.3.3-.1.5-.5.5-.8 0-.2 0-.4-.1-.6-.1-.2-.3-.3-.5-.4-.3-.1-.7-.2-1-.3-.5-.1-1-.1-1.5-.1V9.1c.7.1 1.5-.1 2.2-.4.4-.2.6-.5.6-.9 0-.3-.1-.6-.4-.8-.3-.2-.7-.3-1.1-.3-.4 0-.8.1-1.1.3-.4.2-.7.4-1.1.6l-1.2-1.4c.5-.4 1.1-.7 1.6-.9.5-.2 1.2-.3 1.8-.3.5 0 1 .1 1.6.2.4.1.8.3 1.2.5.3.2.6.5.8.8.2.3.3.7.3 1.1 0 .5-.2.9-.5 1.3-.4.4-.9.7-1.5.9v.1c.6.1 1.2.4 1.6.8.4.4.7.9.7 1.5 0 .4-.1.8-.3 1.2-.2.4-.5.7-.9.9-.4.3-.9.4-1.3.5-.5.1-1 .2-1.6.2-.8 0-1.6-.1-2.3-.4-.6-.2-1.1-.6-1.6-1l1.1-1.4zM7 9H3V5H1v10h2v-4h4v4h2V5H7v4z",
		h4: "M9 15H7v-4H3v4H1V5h2v4h4V5h2v10zm10-2h-1v2h-2v-2h-5v-2l4-6h3v6h1v2zm-3-2V7l-2.8 4H16z",
		h5: "M12.1 12.2c.4.3.7.5 1.1.7.4.2.9.3 1.3.3.5 0 1-.1 1.4-.4.4-.3.6-.7.6-1.1 0-.4-.2-.9-.6-1.1-.4-.3-.9-.4-1.4-.4H14c-.1 0-.3 0-.4.1l-.4.1-.5.2-1-.6.3-5h6.4v1.9h-4.3L14 8.8c.2-.1.5-.1.7-.2.2 0 .5-.1.7-.1.5 0 .9.1 1.4.2.4.1.8.3 1.1.6.3.2.6.6.8.9.2.4.3.9.3 1.4 0 .5-.1 1-.3 1.4-.2.4-.5.8-.9 1.1-.4.3-.8.5-1.3.7-.5.2-1 .3-1.5.3-.8 0-1.6-.1-2.3-.4-.6-.2-1.1-.6-1.6-1-.1-.1 1-1.5 1-1.5zM9 15H7v-4H3v4H1V5h2v4h4V5h2v10z",
		h6: "M9 15H7v-4H3v4H1V5h2v4h4V5h2v10zm8.6-7.5c-.2-.2-.5-.4-.8-.5-.6-.2-1.3-.2-1.9 0-.3.1-.6.3-.8.5l-.6.9c-.2.5-.2.9-.2 1.4.4-.3.8-.6 1.2-.8.4-.2.8-.3 1.3-.3.4 0 .8 0 1.2.2.4.1.7.3 1 .6.3.3.5.6.7.9.2.4.3.8.3 1.3s-.1.9-.3 1.4c-.2.4-.5.7-.8 1-.4.3-.8.5-1.2.6-1 .3-2 .3-3 0-.5-.2-1-.5-1.4-.9-.4-.4-.8-.9-1-1.5-.2-.6-.3-1.3-.3-2.1s.1-1.6.4-2.3c.2-.6.6-1.2 1-1.6.4-.4.9-.7 1.4-.9.6-.3 1.1-.4 1.7-.4.7 0 1.4.1 2 .3.5.2 1 .5 1.4.8 0 .1-1.3 1.4-1.3 1.4zm-2.4 5.8c.2 0 .4 0 .6-.1.2 0 .4-.1.5-.2.1-.1.3-.3.4-.5.1-.2.1-.5.1-.7 0-.4-.1-.8-.4-1.1-.3-.2-.7-.3-1.1-.3-.3 0-.7.1-1 .2-.4.2-.7.4-1 .7 0 .3.1.7.3 1 .1.2.3.4.4.6.2.1.3.3.5.3.2.1.5.2.7.1z",
		p: "M18.3 4H9.9v-.1l-.9.2c-2.3.4-4 2.4-4 4.8s1.7 4.4 4 4.8l.7.1V20h1.5V5.5h2.9V20h1.5V5.5h2.7V4z",
	};
	if (!Object.prototype.hasOwnProperty.call(elementTypeToPath, elementType)) {
		return null;
	}

	return (
		<SVG
			width="24"
			height="24"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
		>
			<Path d={elementTypeToPath[elementType]} />
		</SVG>
	);
}

function MyButtonBlockAppender({ rootClientId }: { rootClientId: string }) {
	return (
		<Inserter
			rootClientId={rootClientId}
			renderToggle={({ onToggle }) => (
				<ButtonGroup>
					<Button
						className="accordion-inserter-button is-primary"
						onClick={onToggle}
					>
						Add a new block
					</Button>
				</ButtonGroup>
			)}
			isAppender
		/>
	);
}
