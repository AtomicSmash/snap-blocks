import type { InterpretedAttributes } from "./index";
import type { BlockEditProps } from "@atomicsmash/blocks-helpers";
import type { Element } from "@wordpress/element";
import {
	useBlockProps,
	InspectorControls,
	InnerBlocks,
	Inserter,
} from "@wordpress/block-editor";
import {
	Button,
	ButtonGroup,
	CheckboxControl,
	Panel,
	PanelBody,
} from "@wordpress/components";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export function Edit({
	clientId,
	attributes,
	setAttributes,
}: BlockEditProps<InterpretedAttributes>): Element {
	const { isMultiple } = attributes;
	const blockProps = useBlockProps();
	setAttributes({ accordionGroupId: clientId });

	return (
		<>
			<InspectorControls>
				<Panel>
					<PanelBody title="Block settings">
						<CheckboxControl
							label="Multiple open accordions"
							help="Allow multiple accordions in the same group to be open at the same time."
							checked={isMultiple}
							onChange={(isInputChecked) => {
								setAttributes({ isMultiple: isInputChecked });
							}}
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>
			<div {...blockProps}>
				<InnerBlocks
					allowedBlocks={["snap-blocks/accordion"]}
					renderAppender={() => (
						<MyButtonBlockAppender rootClientId={clientId} />
					)}
				/>
			</div>
		</>
	);
}

function MyButtonBlockAppender({ rootClientId }: { rootClientId: string }) {
	return (
		<Inserter
			rootClientId={rootClientId}
			renderToggle={({ onToggle }: { onToggle: () => void }) => (
				<ButtonGroup>
					<Button
						className="accordion-inserter-button is-primary"
						onClick={onToggle}
					>
						Add an accordion
					</Button>
				</ButtonGroup>
			)}
			isAppender
		/>
	);
}
