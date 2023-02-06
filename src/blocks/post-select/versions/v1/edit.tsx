import type { InterpretedAttributes } from "./index";
import type { Post, Page } from "@wordpress/core-data";
import type { WPElement } from "@wordpress/element";
import type { Reducer } from "react";
import type { BlockEditProps } from "~/helpers";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
	Panel,
	PanelBody,
	SelectControl,
	// @ts-expect-error Outdated 3rd party WP types 🙄
	SearchControl,
	BaseControl,
	Spinner,
} from "@wordpress/components";
import { useInstanceId } from "@wordpress/compose";
import { store as coreStore, Taxonomy } from "@wordpress/core-data";
import { useSelect } from "@wordpress/data";
import { useReducer, useState, useEffect } from "@wordpress/element";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export function Edit({
	attributes,
	setAttributes,
}: BlockEditProps<InterpretedAttributes>): WPElement {
	const { selectedPosts } = attributes;
	const blockProps = useBlockProps();
	const { filteredPostTypes, mappedTaxonomies } = usePostTypes();
	const [searchInput, setSearchInput] = useState("");
	const [selectedPostType, setSelectedPostType] = useState("any");
	const [taxonomyAndTermSlugs, setTaxonomyAndTermSlugs] = useState<string[]>(
		[]
	);
	const mappedTerms = taxonomyAndTermSlugs.reduce<
		Record<string, string[] | undefined>
	>((accumulator, taxonomyAndTermSlug) => {
		const [taxonomySlug, TermSlug] = taxonomyAndTermSlug.split("__");
		if (accumulator[taxonomySlug] === undefined) {
			accumulator[taxonomySlug] = [];
		}
		// @ts-expect-error This is throwing an error because accumulator is not const, but we are doing a check above so it will never be undefined.
		accumulator[taxonomySlug].push(TermSlug);
		return accumulator;
	}, {});

	const posts = useSelect(
		(select) => {
			const returnObject: Record<string, (Post<"view"> | Page<"view">)[]> = {};
			if (filteredPostTypes) {
				for (const postType of filteredPostTypes) {
					returnObject[postType.slug] =
						select(coreStore).getEntityRecords("postType", postType.slug, {
							per_page: -1,
							context: "view",
							...mappedTerms,
							search: searchInput,
						}) ?? [];
				}
			}
			return returnObject;
		},
		[filteredPostTypes]
	);

	function updateSelectedPosts(
		type: "add" | "remove" | "update_list",
		listOrItem:
			| InterpretedAttributes["selectedPosts"]
			| InterpretedAttributes["selectedPosts"][number]
	): void {
		if (type === "add") {
			if (Array.isArray(listOrItem)) {
				throw new Error(`You can't pass an array if your type is ${type}`);
			}
			setAttributes({
				selectedPosts: [...selectedPosts, listOrItem],
			});
		}
		if (type === "remove") {
			if (Array.isArray(listOrItem)) {
				throw new Error(`You can't pass an array if your type is ${type}`);
			}
			setAttributes({
				selectedPosts: selectedPosts.filter((filterListItem) => {
					return filterListItem.id !== listOrItem.id;
				}),
			});
		}
		if (type === "update_list") {
			if (!Array.isArray(listOrItem)) {
				throw new Error(`You must pass an array if your type is ${type}`);
			}
			setAttributes({
				selectedPosts: listOrItem,
			});
		}
	}

	return (
		<>
			<InspectorControls>
				<Panel>
					<PanelBody title="Select posts">
						<SelectControl<typeof selectedPostType>
							label="Post Type"
							value={selectedPostType}
							options={
								filteredPostTypes
									? [
											...filteredPostTypes.map(({ labels, slug }) => ({
												label:
													labels.singular_name ??
													"Error: Unable to retrieve post type name.",
												value: slug,
											})),
											{ label: "Any", value: "any" },
									  ]
									: [{ label: "Any", value: "any" }]
							}
							onChange={(newPostType) => {
								setSelectedPostType(newPostType);
							}}
						/>
						{mappedTaxonomies
							? mappedTaxonomies[selectedPostType]?.map((taxonomy) => {
									if (!taxonomy.terms || taxonomy.terms.length === 0) {
										return null;
									}
									return (
										<BaseControl
											key={taxonomy.slug}
											id={`${taxonomy.slug}-custom-multiple-select-list`}
											label={taxonomy.name}
										>
											<CustomMultipleSelectList
												list={taxonomy.terms.map((term) => {
													const uniqueId = `${taxonomy.slug}__${term.slug}`;
													return {
														id: uniqueId,
														title: term.name,
														isSelected: taxonomyAndTermSlugs.includes(uniqueId),
													};
												})}
												updateListCallback={(type, listOrItem) => {
													if (type === "add") {
														if (Array.isArray(listOrItem)) {
															throw new Error(
																`You can't pass an array if your type is ${type}`
															);
														}
														setTaxonomyAndTermSlugs([
															...taxonomyAndTermSlugs,
															listOrItem.id,
														]);
													}
													if (type === "remove") {
														if (Array.isArray(listOrItem)) {
															throw new Error(
																`You can't pass an array if your type is ${type}`
															);
														}
														setTaxonomyAndTermSlugs(
															taxonomyAndTermSlugs.filter((filterListItem) => {
																return filterListItem !== listOrItem.id;
															})
														);
													}
												}}
											/>
										</BaseControl>
									);
							  })
							: null}
						<SearchControl
							label="Search"
							hideLabelFromVision={false}
							help="Type your search term in the box above"
							value={searchInput}
							onChange={setSearchInput}
						/>
						<BaseControl
							id={useInstanceId(BaseControl, "custom-multiple-select-list-id-")}
							label={"Search results"}
						>
							<CustomMultipleSelectList
								list={
									(selectedPostType !== "any"
										? posts[selectedPostType]
										: Object.values(posts)
												.flat(1)
												.sort((a, b) => {
													if (a.date === null || b.date === null) {
														throw new Error(
															"Error getting the published date."
														);
													}
													const dateTimeA = new Date(a.date).getTime();
													const dateTimeB = new Date(b.date).getTime();
													if (dateTimeA < dateTimeB) {
														return -1;
													}
													if (dateTimeA > dateTimeB) {
														return 1;
													}
													return 0;
												})
									).map((searchedPost) => ({
										id: `${searchedPost.id}`,
										title: searchedPost.title.rendered,
										isSelected: !!selectedPosts.find((selectedPost) => {
											return (
												`${searchedPost.id}` === selectedPost.id &&
												searchedPost.title.rendered === selectedPost.title
											);
										}),
									})) ?? []
								}
								updateListCallback={updateSelectedPosts}
								itemClassName={({ isSelected }) => (isSelected ? `hide` : "")}
							/>
						</BaseControl>
						<BaseControl
							id={useInstanceId(BaseControl, "draggable-list-id-")}
							label={"Selected posts"}
							help={
								selectedPosts.length > 0
									? "You can drag and drop the posts above to change the order that they appear in."
									: "Use the filters above to select the posts you would like to show in this block."
							}
						>
							<DraggableList<InterpretedAttributes["selectedPosts"][number]>
								list={selectedPosts}
								updateListCallback={updateSelectedPosts}
							/>
						</BaseControl>
					</PanelBody>
				</Panel>
			</InspectorControls>
			<div {...blockProps}>
				{selectedPosts.length > 0 ? (
					selectedPosts.map((selectedPost) => {
						return (
							<article
								className="selected-post"
								key={selectedPost.id}
								data-post-id={selectedPost.id}
							>
								<h3>
									{selectedPost.title === ""
										? "(no title)"
										: selectedPost.title}
								</h3>
							</article>
						);
					})
				) : (
					<div>Pick your posts to show in the sidebar.</div>
				)}
			</div>
		</>
	);
}

type UpdateListCallback<ListItem> = (
	type: "add" | "remove" | "update_list",
	listOrItem: ListItem[] | ListItem
) => void;

type PostType = {
	capabilities: Record<string, string>;
	description: string;
	has_archive: boolean;
	hierarchical: boolean;
	icon: string | null;
	labels: Record<string, string | null>;
	name: string;
	rest_base: string;
	rest_namespace: string;
	slug: string;
	supports: Record<string, boolean>;
	taxonomies: string[];
	viewable: boolean;
	visibility: {
		public: boolean;
		publicly_queryable: boolean;
		show_admin_column: boolean;
		show_in_nav_menus: boolean;
		show_in_quick_edit: boolean;
		show_ui: boolean;
	};
	_links: {
		collection: { href: string };
		curies: { name: string; href: string; templated: boolean };
		"wp:items": { href: string };
	};
};
type TaxonomyTerms = {
	count: number;
	description: string;
	id: number;
	link: string;
	meta: never[];
	name: string;
	parent: number;
	slug: string;
	taxonomy: string;
	_links: {
		about: { href: string };
		collection: { href: string };
		curies: { name: string; href: string; templated: boolean };
		self: { href: string };
		"wp:post_type": { href: string };
	};
};

/**
 * UsePostTypes hook
 */
export const usePostTypes = () => {
	const { postTypes, taxonomies } = useSelect((select) => {
		const { getEntityRecords } = select(coreStore);
		const excludedPostTypes = ["attachment"];
		const filteredPostTypes = getEntityRecords<PostType>("root", "postType", {
			per_page: -1,
		})?.filter(
			({ viewable, slug }) => viewable && !excludedPostTypes.includes(slug)
		);
		if (!filteredPostTypes || filteredPostTypes.length === 0) {
			return { postTypes: filteredPostTypes, taxonomies: undefined };
		}
		const mappedTaxonomies: Record<
			PostType["slug"],
			(Taxonomy<"view"> & { terms: TaxonomyTerms[] | null })[] | undefined
		> = {};
		const excludedTaxonomies: string[] = [];
		for (const postType of filteredPostTypes) {
			const filteredTaxonomies = getEntityRecords<Taxonomy<"view">>(
				"root",
				"taxonomy",
				{ per_page: -1, orderby: "name" }
			)?.filter(
				({ types, slug }) =>
					types.includes(postType.slug) && !excludedTaxonomies.includes(slug)
			);
			if (!filteredTaxonomies) continue;
			mappedTaxonomies[postType.slug] = filteredTaxonomies.map((taxonomy) => {
				const filteredTaxonomyTerms = getEntityRecords<TaxonomyTerms>(
					"taxonomy",
					taxonomy.slug
				);
				return { ...taxonomy, terms: filteredTaxonomyTerms };
			});
		}

		return { postTypes: filteredPostTypes, taxonomies: mappedTaxonomies };
	}, []);

	return {
		filteredPostTypes: postTypes,
		mappedTaxonomies: taxonomies,
	};
};

/**
 * Draggable list React component
 */
type ListState<ListItem> = {
	listItemBeingDragged: string | null;
	draggedItemOriginalPosition: number | null;
	draggedItemFalseOrder: number | null;
	list: ListItem[];
};
type DragAction<ListItem> =
	| {
			type: "start_being_dragged";
			itemId: string;
			itemIndex: number;
	  }
	| {
			type: "temporarily_rearrange_items";
			newOrder: number;
	  }
	| {
			type: "end_being_dragged";
			falseOrder: number | null;
			updateListCallback: (type: "update_list", listOrItem: ListItem[]) => void;
	  }
	| {
			type: "remove_from_list";
			updateListCallback: (
				type: "add" | "remove",
				listOrItem: ListItem
			) => void;
			itemId: string;
	  }
	| {
			type: "update_list_from_props";
			newList: ListItem[];
	  };

function isSomethingBeingDragged<ListItem>(
	state: ListState<ListItem>
): state is {
	listItemBeingDragged: string;
	draggedItemOriginalPosition: number;
	draggedItemFalseOrder: number;
	list: ListState<ListItem>["list"];
} {
	return !(
		state.listItemBeingDragged === null ||
		state.draggedItemOriginalPosition === null
	);
}

export function DraggableList<ListItem extends { id: string; title: string }>({
	list,
	updateListCallback,
	...controlProps
}: {
	list: ListItem[];
	updateListCallback: UpdateListCallback<ListItem>;
} & BaseControl.ControlProps) {
	useEffect(() => {
		setListState({
			type: "update_list_from_props",
			newList: list,
		});
	}, [list]);
	function dragReducer(
		state: ListState<ListItem>,
		action: DragAction<ListItem>
	) {
		const currentState = state;
		let newState: ListState<ListItem>;
		switch (action.type) {
			case "start_being_dragged": {
				newState = {
					listItemBeingDragged: action.itemId,
					draggedItemOriginalPosition: action.itemIndex,
					draggedItemFalseOrder: action.itemIndex + 0.5,
					list: currentState.list,
				};
				break;
			}
			case "temporarily_rearrange_items": {
				if (!isSomethingBeingDragged(currentState)) {
					newState = currentState;
					break;
				}
				newState = {
					listItemBeingDragged: currentState.listItemBeingDragged,
					draggedItemOriginalPosition: currentState.draggedItemOriginalPosition,
					draggedItemFalseOrder: action.newOrder,
					list: currentState.list,
				};
				break;
			}
			case "end_being_dragged": {
				if (action.falseOrder === null) {
					return currentState;
				}
				const doubledUpArray: (ListItem | null)[] = [];
				doubledUpArray[0] = null;
				currentState.list.forEach((listItem) => {
					doubledUpArray.push(listItem);
					doubledUpArray.push(null);
				});
				const movedItem = currentState.list.find(
					(listItem) => listItem.id === currentState.listItemBeingDragged
				);
				if (!movedItem) throw new Error("Failed to find moved item in list.");
				const movedItemIndex = doubledUpArray.indexOf(movedItem);
				doubledUpArray[action.falseOrder + 1] = movedItem;
				if (movedItemIndex !== action.falseOrder + 1) {
					doubledUpArray[movedItemIndex] = null;
				}
				const newList = doubledUpArray.filter(
					(value): value is ListItem => value !== null
				);
				newState = {
					listItemBeingDragged: null,
					draggedItemOriginalPosition: null,
					draggedItemFalseOrder: null,
					list: currentState.list, // This will get updated on rerender triggered by the below update callback.
				};
				action.updateListCallback("update_list", newList);
				break;
			}
			case "remove_from_list": {
				newState = currentState; // This will get updated on rerender triggered by the below update callback.
				const removedItem = currentState.list.find(
					(listItem) => listItem.id === action.itemId
				);
				if (!removedItem) {
					break;
				}
				action.updateListCallback("remove", removedItem);
				break;
			}
			case "update_list_from_props": {
				newState = {
					...currentState,
					list: action.newList,
				};
				break;
			}
		}
		return newState;
	}
	const [listState, setListState] = useReducer<
		Reducer<ListState<ListItem>, DragAction<ListItem>>
	>(dragReducer, {
		listItemBeingDragged: null,
		draggedItemOriginalPosition: null,
		draggedItemFalseOrder: null,
		list,
	});

	return (
		<div
			{...controlProps}
			className={`draggable-list${
				isSomethingBeingDragged(listState) ? " is-dragging" : ""
			}`}
		>
			{listState.list.map((listItem, index) => {
				return (
					<div
						key={listItem.id}
						className={`draggable-list-item${
							listState.listItemBeingDragged === listItem.id
								? " being-dragged"
								: ""
						}`}
						style={{
							order:
								listState.listItemBeingDragged === listItem.id
									? listState.draggedItemFalseOrder ?? index * 2
									: index * 2,
						}}
					>
						<div
							className="drag-zone-top"
							onDragOver={(event) => {
								event.preventDefault();
								if (listState.listItemBeingDragged === listItem.id) {
									return;
								}
								setListState({
									type: "temporarily_rearrange_items",
									newOrder: index * 2 - 1,
								});
							}}
						></div>
						<div
							className="drag-handle"
							onDragStart={() =>
								setTimeout(() => {
									setListState({
										type: "start_being_dragged",
										itemId: listItem.id,
										itemIndex: index,
									});
								}, 10)
							}
							onDragEnd={() =>
								setListState({
									type: "end_being_dragged",
									falseOrder: listState.draggedItemFalseOrder,
									updateListCallback,
								})
							}
							draggable
						>
							<svg
								width="24"
								height="24"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								aria-hidden="true"
								focusable="false"
							>
								<path d="M8 7h2V5H8v2zm0 6h2v-2H8v2zm0 6h2v-2H8v2zm6-14v2h2V5h-2zm0 8h2v-2h-2v2zm0 6h2v-2h-2v2z"></path>
							</svg>
						</div>
						<span>{listItem.title === "" ? "(no title)" : listItem.title}</span>
						<button
							className="remove-button"
							onClick={() => {
								setListState({
									type: "remove_from_list",
									itemId: listItem.id,
									updateListCallback,
								});
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
								<rect x="0" fill="none" width="20" height="20" />
								<g>
									<path d="M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zM6 9v2h8V9H6z" />
								</g>
							</svg>
						</button>
						<div
							className="drag-zone-bottom"
							onDragOver={(event) => {
								event.preventDefault();
								if (listState.listItemBeingDragged === listItem.id) {
									return;
								}
								setListState({
									type: "temporarily_rearrange_items",
									newOrder: index * 2 + 1,
								});
							}}
						></div>
					</div>
				);
			})}
		</div>
	);
}

/**
 * Custom multiple select list component
 */
export function CustomMultipleSelectList<
	ListItem extends { id: string; title: string; isSelected: boolean }
>({
	list,
	updateListCallback,
	containerClassName,
	itemClassName,
	isResolving = false,
}: {
	list: ListItem[];
	updateListCallback: (type: "add" | "remove", listOrItem: ListItem) => void;
	containerClassName?: string;
	itemClassName?:
		| string
		| (({ isSelected }: { isSelected: boolean }) => string);
	isResolving?: boolean | undefined;
}) {
	if (isResolving) {
		return (
			<section className="custom-multiple-select-list">
				<Spinner />
			</section>
		);
	}
	return (
		<section
			className={`custom-multiple-select-list${
				containerClassName !== undefined && containerClassName !== ""
					? ` ${containerClassName}`
					: ""
			}`}
		>
			{list.map((listItem) => {
				return (
					<button
						key={listItem.id}
						onClick={(event) => {
							event.preventDefault();
							updateListCallback(
								listItem.isSelected ? "remove" : "add",
								listItem
							);
						}}
						className={`custom-multiple-select-list-item${
							listItem.isSelected ? " is-selected" : ""
						}${typeof itemClassName === "string" ? ` ${itemClassName}` : ""}${
							typeof itemClassName === "function"
								? ` ${itemClassName({ isSelected: listItem.isSelected })}`
								: ""
						}`}
					>
						{listItem.isSelected ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="24"
								height="24"
								role="presentation"
								focusable="false"
							>
								<path d="M16.7 7.1l-6.3 8.5-3.3-2.5-.9 1.2 4.5 3.4L17.9 8z"></path>
							</svg>
						) : null}{" "}
						{listItem.title === "" ? "(no title)" : listItem.title}
					</button>
				);
			})}
		</section>
	);
}
