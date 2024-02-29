import type { InterpretedAttributes } from "./index";
import type { BlockSaveProps } from "@atomicsmash/blocks-helpers";
import type { Element } from "@wordpress/element";
import { useBlockProps } from "@wordpress/block-editor";

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {Element} Element to render.
 */
export function Save({
	attributes,
}: BlockSaveProps<InterpretedAttributes>): Element {
	const { selectedPosts } = attributes;
	const blockProps = useBlockProps.save();
	return (
		<div {...blockProps}>
			{selectedPosts.map((selectedPost) => {
				return (
					<article
						className="selected-post"
						key={selectedPost.id}
						data-post-id={selectedPost.id}
						data-post-type={selectedPost.postType}
					>
						<h3>{selectedPost.title}</h3>
					</article>
				);
			})}
		</div>
	);
}
