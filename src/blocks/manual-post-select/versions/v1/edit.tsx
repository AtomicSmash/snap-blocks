import type { InterpretedAttributes } from "./index";
import type { Post, Page } from "@wordpress/core-data";
import type { WPElement } from "@wordpress/element";
import { ButtonHTMLAttributes, Fragment, Reducer } from "react";
import type { BlockEditProps } from "~/helpers";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
	Panel,
	PanelBody,
	SelectControl,
	// @ts-expect-error Outdated 3rd party WP types 🙄
	SearchControl,
	BaseControl,
	// spellchecker: disable-next-line
	Dashicon as DashIcon,
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

	const posts = useSelect(
		(select) => {
			const returnObject: Record<string, (Post<"view"> | Page<"view">)[]> = {};
			if (filteredPostTypes) {
				for (const postType of filteredPostTypes) {
					returnObject[postType.slug] =
						select(coreStore).getEntityRecords("postType", postType.slug, {
							per_page: -1,
							context: "view",
							search: searchInput,
							...taxonomyAndTermSlugs.reduce<
								Record<string, string[] | undefined>
							>((accumulator, taxonomyAndTermSlug) => {
								const [taxonomySlug, TermSlug] =
									taxonomyAndTermSlug.split("__");
								if (accumulator[taxonomySlug] === undefined) {
									accumulator[taxonomySlug] = [];
								}
								// @ts-expect-error This is throwing an error because accumulator is not const, but we are doing a check above so it will never be undefined.
								accumulator[taxonomySlug].push(TermSlug);
								return accumulator;
							}, {}),
						}) ?? [];
				}
			}
			return returnObject;
		},
		[filteredPostTypes, searchInput, taxonomyAndTermSlugs]
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
												renderItem={({ listItem, buttonProps }) => {
													return (
														<button
															key={listItem.id}
															{...buttonProps}
															onClick={(event) => {
																event.preventDefault();
																if (listItem.isSelected) {
																	setTaxonomyAndTermSlugs(
																		taxonomyAndTermSlugs.filter(
																			(filterListItem) => {
																				return filterListItem !== listItem.id;
																			}
																		)
																	);
																} else {
																	setTaxonomyAndTermSlugs([
																		...taxonomyAndTermSlugs,
																		listItem.id,
																	]);
																}
															}}
														>
															<span className="custom-multiple-select-list-item-label">
																{listItem.title === ""
																	? "(no title)"
																	: listItem.title}
															</span>
															{listItem.isSelected ? (
																<svg
																	width="14"
																	height="11"
																	viewBox="0 0 14 11"
																	fill="none"
																	xmlns="http://www.w3.org/2000/svg"
																	focusable={false}
																	role="presentation"
																>
																	<path
																		d="M1 5L5 9L13 1"
																		stroke="currentColor"
																		strokeWidth="2"
																		strokeLinecap="round"
																	/>
																</svg>
															) : null}
														</button>
													);
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
										postType: searchedPost.type,
										icon: filteredPostTypes?.find(
											(postType) => postType.slug === searchedPost.type
										)?.icon,
										itemLabel:
											filteredPostTypes?.find(
												(postType) => postType.slug === searchedPost.type
											)?.labels.singular_name ?? undefined,
										isSelected: !!selectedPosts.find((selectedPost) => {
											return (
												`${searchedPost.id}` === selectedPost.id &&
												searchedPost.title.rendered === selectedPost.title
											);
										}),
									})) ?? []
								}
								renderItem={({ listItem, buttonProps }) => {
									if (listItem.isSelected) return null;
									return (
										<button
											{...buttonProps}
											key={listItem.id}
											onClick={() => {
												updateSelectedPosts("add", listItem);
											}}
										>
											<WPMenuIcon iconString={listItem.icon} />
											<span className="custom-multiple-select-list-item-label">
												{listItem.title === "" ? "(no title)" : listItem.title}
											</span>
										</button>
									);
								}}
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
							<DraggableList
								list={selectedPosts.map((selectedPost) => ({
									...selectedPost,
									icon:
										filteredPostTypes?.find(
											(postType) => postType.slug === selectedPost.postType
										)?.icon ?? undefined,
								}))}
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
								data-post-type={selectedPost.postType}
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
const usePostTypes = () => {
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

function DraggableList<
	ListItem extends { id: string; title: string; icon?: string }
>({
	list,
	updateListCallback,
	containerClassName,
	itemClassName,
	itemLabelClassName,
	...controlProps
}: {
	list: ListItem[];
	updateListCallback: UpdateListCallback<ListItem>;
	containerClassName?: string;
	itemClassName?: string;
	itemLabelClassName?: string;
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
					draggedItemFalseOrder: action.itemIndex + 1,
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
				console.log({ action, currentState });
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
				console.log({ movedItem, doubledUpArray: [...doubledUpArray] });
				if (!movedItem) throw new Error("Failed to find moved item in list.");
				const movedItemIndex = doubledUpArray.indexOf(movedItem);
				console.log({ movedItemIndex });
				doubledUpArray[action.falseOrder + 1] = movedItem;
				console.log({ doubledUpArrayAfterAdd: [...doubledUpArray] });
				if (movedItemIndex !== action.falseOrder + 1) {
					doubledUpArray[movedItemIndex] = null;
				}
				console.log({ doubledUpArrayAfterRemove: [...doubledUpArray] });
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
			}${
				containerClassName !== undefined && containerClassName !== ""
					? ` ${containerClassName}`
					: ""
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
						}${typeof itemClassName === "string" ? ` ${itemClassName}` : ""}`}
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
								width="9"
								height="21"
								viewBox="0 0 9 21"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
								<circle cx="7.5" cy="1.5" r="1.5" fill="currentColor" />
								<circle cx="1.5" cy="7.5" r="1.5" fill="currentColor" />
								<circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
								<circle cx="1.5" cy="13.5" r="1.5" fill="currentColor" />
								<circle cx="7.5" cy="13.5" r="1.5" fill="currentColor" />
								<circle cx="1.5" cy="19.5" r="1.5" fill="currentColor" />
								<circle cx="7.5" cy="19.5" r="1.5" fill="currentColor" />
							</svg>
						</div>
						<div className="draggable-list-item-content">
							<WPMenuIcon iconString={listItem.icon} />
							<span className="draggable-list-item-text">
								{listItem.title === "" ? "(no title)" : listItem.title}
							</span>
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
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill="currentColor"
										d="M8,0C3.6,0,0,3.6,0,8s3.6,8,8,8s8-3.6,8-8S12.4,0,8,0z M11,10.3c0.2,0.2,0.2,0.5,0,0.7s-0.5,0.2-0.7,0L8,8.7
		L5.7,11c-0.2,0.2-0.5,0.2-0.7,0s-0.2-0.5,0-0.7L7.3,8L5,5.7C4.8,5.5,4.8,5.2,5,5c0.2-0.2,0.5-0.2,0.7,0L8,7.3L10.3,5
		c0.2-0.2,0.5-0.2,0.7,0s0.2,0.5,0,0.7L8.7,8L11,10.3z"
									/>
								</svg>
							</button>
						</div>
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
function CustomMultipleSelectList<
	ListItem extends {
		id: string;
		title: string;
		itemLabel?: string;
		isSelected: boolean;
	}
>({
	list,
	containerClassName,
	renderItem,
}: {
	list: ListItem[];
	containerClassName?: string;
	renderItem: ({
		listItem,
		buttonProps,
	}: {
		listItem: ListItem;
		buttonProps: ButtonHTMLAttributes<HTMLButtonElement>;
	}) => React.ReactNode;
}) {
	return (
		<section
			className={`custom-multiple-select-list${
				containerClassName !== undefined && containerClassName !== ""
					? ` ${containerClassName}`
					: ""
			}`}
		>
			{list.map((listItem) => {
				return renderItem({
					listItem,
					buttonProps: {
						type: "button",
						className: `custom-multiple-select-list-item${
							listItem.isSelected ? " is-selected" : ""
						}`,
					},
				});
			})}
		</section>
	);
}

function WPMenuIcon({ iconString }: { iconString: string | undefined | null }) {
	if (!iconString) {
		return null;
	}
	if (iconString === "none" || iconString === "div") {
		return (
			<div className="menu-icon" aria-hidden="true">
				<br />
			</div>
		);
	}
	if (0 === iconString.indexOf("data:image/svg+xml;base64,")) {
		return (
			<div
				className="menu-icon svg"
				style={{ backgroundImage: `url('${iconString}')` }}
				aria-hidden="true"
			>
				<br />
			</div>
		);
	}
	// spellchecker: disable-next-line
	if (0 === iconString.indexOf("dashicons-")) {
		// spellchecker: disable-next-line
		const potentialDashIcon = iconString.replace("dashicons-", "");
		if (isDashIcon(potentialDashIcon)) {
			return <DashIcon icon={potentialDashIcon} className="menu-icon" />;
		}
	}
	return <img src={new URL(iconString).toString()} alt="" />;
}

function isDashIcon(iconName: string): iconName is DashIcon.Icon {
	// spellchecker: disable
	return [
		"admin-appearance",
		"admin-collapse",
		"admin-comments",
		"admin-customizer",
		"admin-generic",
		"admin-home",
		"admin-links",
		"admin-media",
		"admin-multisite",
		"admin-network",
		"admin-page",
		"admin-plugins",
		"admin-post",
		"admin-settings",
		"admin-site",
		"admin-site-alt",
		"admin-site-alt2",
		"admin-site-alt3",
		"admin-tools",
		"admin-users",
		"airplane",
		"album",
		"align-center",
		"align-full-width",
		"align-left",
		"align-none",
		"align-pull-left",
		"align-pull-right",
		"align-right",
		"align-wide",
		"amazon",
		"analytics",
		"archive",
		"arrow-down",
		"arrow-down-alt",
		"arrow-down-alt2",
		"arrow-left",
		"arrow-left-alt",
		"arrow-left-alt2",
		"arrow-right",
		"arrow-right-alt",
		"arrow-right-alt2",
		"arrow-up",
		"arrow-up-alt",
		"arrow-up-alt2",
		"art",
		"awards",
		"backup",
		"bank",
		"beer",
		"bell",
		"block-default",
		"book",
		"book-alt",
		"buddicons-activity",
		"buddicons-bbpress-logo",
		"buddicons-buddypress-logo",
		"buddicons-community",
		"buddicons-forums",
		"buddicons-friends",
		"buddicons-groups",
		"buddicons-pm",
		"buddicons-replies",
		"buddicons-topics",
		"buddicons-tracking",
		"building",
		"businessman",
		"businessperson",
		"businesswoman",
		"button",
		"calculator",
		"calendar",
		"calendar-alt",
		"camera",
		"camera-alt",
		"car",
		"carrot",
		"cart",
		"category",
		"chart-area",
		"chart-bar",
		"chart-line",
		"chart-pie",
		"clipboard",
		"clock",
		"cloud",
		"cloud-saved",
		"cloud-upload",
		"code-standards",
		"coffee",
		"color-picker",
		"columns",
		"controls-back",
		"controls-forward",
		"controls-pause",
		"controls-play",
		"controls-repeat",
		"controls-skipback",
		"controls-skipforward",
		"controls-volumeoff",
		"controls-volumeon",
		"cover-image",
		"dashboard",
		"database",
		"database-add",
		"database-export",
		"database-import",
		"database-remove",
		"database-view",
		"desktop",
		"dismiss",
		"download",
		"drumstick",
		"edit",
		"edit-large",
		"edit-page",
		"editor-aligncenter",
		"editor-alignleft",
		"editor-alignright",
		"editor-bold",
		"editor-break",
		"editor-code",
		"editor-contract",
		"editor-customchar",
		"editor-expand",
		"editor-help",
		"editor-indent",
		"editor-insertmore",
		"editor-italic",
		"editor-justify",
		"editor-kitchensink",
		"editor-ltr",
		"editor-ol",
		"editor-ol-rtl",
		"editor-outdent",
		"editor-paragraph",
		"editor-paste-text",
		"editor-paste-word",
		"editor-quote",
		"editor-removeformatting",
		"editor-rtl",
		"editor-spellcheck",
		"editor-strikethrough",
		"editor-table",
		"editor-textcolor",
		"editor-ul",
		"editor-underline",
		"editor-unlink",
		"editor-video",
		"ellipsis",
		"email",
		"email-alt",
		"email-alt2",
		"embed-audio",
		"embed-generic",
		"embed-photo",
		"embed-post",
		"embed-video",
		"excerpt-view",
		"exit",
		"external",
		"facebook",
		"facebook-alt",
		"feedback",
		"filter",
		"flag",
		"food",
		"format-aside",
		"format-audio",
		"format-chat",
		"format-gallery",
		"format-image",
		"format-quote",
		"format-status",
		"format-video",
		"forms",
		"fullscreen-alt",
		"fullscreen-exit-alt",
		"games",
		"google",
		"grid-view",
		"groups",
		"hammer",
		"heading",
		"heart",
		"hidden",
		"hourglass",
		"html",
		"id",
		"id-alt",
		"image-crop",
		"image-filter",
		"image-flip-horizontal",
		"image-flip-vertical",
		"image-rotate",
		"image-rotate-left",
		"image-rotate-right",
		"images-alt",
		"images-alt2",
		"index-card",
		"info",
		"info-outline",
		"insert",
		"insert-after",
		"insert-before",
		"instagram",
		"laptop",
		"layout",
		"leftright",
		"lightbulb",
		"linkedin",
		"list-view",
		"location",
		"location-alt",
		"lock",
		"marker",
		"media-archive",
		"media-audio",
		"media-code",
		"media-default",
		"media-document",
		"media-interactive",
		"media-spreadsheet",
		"media-text",
		"media-video",
		"megaphone",
		"menu",
		"menu-alt",
		"menu-alt2",
		"menu-alt3",
		"microphone",
		"migrate",
		"minus",
		"money",
		"money-alt",
		"move",
		"nametag",
		"networking",
		"no",
		"no-alt",
		"open-folder",
		"palmtree",
		"paperclip",
		"pdf",
		"performance",
		"pets",
		"phone",
		"pinterest",
		"playlist-audio",
		"playlist-video",
		"plugins-checked",
		"plus",
		"plus-alt",
		"plus-alt2",
		"podio",
		"portfolio",
		"post-status",
		"pressthis",
		"printer",
		"privacy",
		"products",
		"randomize",
		"reddit",
		"redo",
		"remove",
		"rest-api",
		"rss",
		"saved",
		"schedule",
		"screenoptions",
		"search",
		"share",
		"share-alt",
		"share-alt2",
		"shield",
		"shield-alt",
		"shortcode",
		"slides",
		"smartphone",
		"smiley",
		"sort",
		"sos",
		"spotify",
		"star-empty",
		"star-filled",
		"star-half",
		"sticky",
		"store",
		"superhero",
		"superhero-alt",
		"table-col-after",
		"table-col-before",
		"table-col-delete",
		"table-row-after",
		"table-row-before",
		"table-row-delete",
		"tablet",
		"tag",
		"tagcloud",
		"testimonial",
		"text",
		"text-page",
		"thumbs-down",
		"thumbs-up",
		"tickets",
		"tickets-alt",
		"tide",
		"translation",
		"trash",
		"twitch",
		"twitter",
		"twitter-alt",
		"undo",
		"universal-access",
		"universal-access-alt",
		"unlock",
		"update",
		"update-alt",
		"upload",
		"vault",
		"video-alt",
		"video-alt2",
		"video-alt3",
		"visibility",
		"warning",
		"welcome-add-page",
		"welcome-comments",
		"welcome-learn-more",
		"welcome-view-site",
		"welcome-widgets-menus",
		"welcome-write-blog",
		"whatsapp",
		"wordpress",
		"wordpress-alt",
		"xing",
		"yes",
		"yes-alt",
		"youtube",
	].includes(iconName);
	// spellchecker: enable
}
