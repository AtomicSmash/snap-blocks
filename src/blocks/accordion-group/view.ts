import domReady from "@wordpress/dom-ready";

class AccordionGroup {
	private id: string;
	private accordionGroup: HTMLDivElement;
	public allowMultipleOpenAccordions: boolean;
	private childAccordions: Accordion[] = [];

	constructor(accordionGroup: HTMLDivElement) {
		this.accordionGroup = accordionGroup;
		const accordionGroupId = accordionGroup.id;
		if (accordionGroupId === undefined || accordionGroupId === "") {
			throw new Error("Failed to get ID of accordion.");
		}
		this.id = accordionGroupId;
		this.allowMultipleOpenAccordions =
			accordionGroup.dataset.isMultiple === "true";
		this.initialiseAccordions();
	}
	public getId() {
		return this.id;
	}
	public closeAllAccordions() {
		for (const accordion of this.childAccordions) {
			accordion.close();
		}
	}
	private initialiseAccordions() {
		const accordionsInGroup =
			this.accordionGroup.querySelectorAll<HTMLElement>("[data-accordion]");
		let isFirstInitiallyOpenAccordion = true;
		for (const accordionElement of accordionsInGroup) {
			const shouldTryToRemainOpen =
				accordionElement.dataset.isInitiallyOpen === "true";
			let isInitiallyOpen: boolean;
			if (this.allowMultipleOpenAccordions) {
				isInitiallyOpen = shouldTryToRemainOpen;
			} else if (isFirstInitiallyOpenAccordion) {
				isInitiallyOpen = true;
				isFirstInitiallyOpenAccordion = false;
			} else {
				isInitiallyOpen = false;
			}
			const accordion = new Accordion(accordionElement, this);
			if (!isInitiallyOpen) {
				accordion.close();
			}
			this.childAccordions.push(accordion);
		}
	}
}

function getTimeInMilliseconds(time: string) {
	if (new RegExp("ms$", "ig").test(time)) {
		return Number(time.substring(0, time.length - 2));
	}
	if (new RegExp("s$", "ig").test(time)) {
		return Number(time.substring(0, time.length - 1)) * 1000;
	}
	throw new Error(`Time didn't end with ms or s so was not correctly parsed.`);
}

function getNumberFromStringPixels(height: string | undefined) {
	if (height === undefined) {
		return undefined;
	}
	return Number(height.replace("px", ""));
}

class Accordion {
	private id: string;
	private state: "open" | "collapsed";
	private accordionGroup: AccordionGroup;
	public trigger: HTMLButtonElement;
	public panel: HTMLDivElement;
	private closeTimeout: NodeJS.Timeout | null = null;
	private heightOfOpenAccordion: number | null = null;

	constructor(accordion: HTMLElement, accordionGroup: AccordionGroup) {
		const accordionId = accordion.id;
		if (accordionId === undefined || accordionId === "") {
			throw new Error("Failed to get ID of accordion.");
		}
		this.id = accordionId;
		this.state = "open";
		const trigger = document.getElementById(
			`${accordionId}-trigger`,
		) as HTMLButtonElement | null;
		if (!trigger) {
			throw new Error("Unable to determine the accordions trigger button.");
		}
		this.trigger = trigger;
		const panel = document.getElementById(
			`${accordionId}-panel`,
		) as HTMLDivElement | null;
		if (!panel) {
			throw new Error("Unable to determine the accordions content panel.");
		}
		this.panel = panel;
		this.accordionGroup = accordionGroup;
		this.trigger.addEventListener("click", () => {
			this.toggle();
		});

		this.panel.style.height = getComputedStyle(this.panel).getPropertyValue(
			"height",
		);
	}
	public getId() {
		return this.id;
	}
	public getState() {
		return this.state;
	}
	public open() {
		if (!this.accordionGroup.allowMultipleOpenAccordions) {
			this.heightOfOpenAccordion =
				getNumberFromStringPixels(
					document.querySelector<HTMLDivElement>(
						`.accordion-panel[data-state="open"]`,
					)?.style.height,
				) ?? 0;
			this.accordionGroup.closeAllAccordions();
			if (this.closeTimeout) {
				clearTimeout(this.closeTimeout);
			}
		}
		this.panel.style.display = "";
		// Set timeout is used to push these changes to the next tick so the transition occurs as expected.
		setTimeout(() => {
			this.state = "open";
			this.panel.removeAttribute("aria-hidden");
			this.panel.setAttribute("data-state", "open");
			this.trigger.setAttribute("aria-expanded", "true");
			this.trigger.setAttribute("data-state", "open");
			if (!this.accordionGroup.allowMultipleOpenAccordions) {
				window.scrollBy({
					top: -1 * (this.heightOfOpenAccordion ?? 0),
					behavior: "smooth",
				});
				this.heightOfOpenAccordion = null;
			}
		}, 1);
	}
	public close() {
		this.state = "collapsed";
		this.panel.setAttribute("aria-hidden", "true");
		this.panel.setAttribute("data-state", "collapsed");
		this.trigger.setAttribute("aria-expanded", "false");
		this.trigger.setAttribute("data-state", "collapsed");
		const accordionOpenCloseTiming = getTimeInMilliseconds(
			getComputedStyle(this.panel).getPropertyValue(
				"--snap-accordion-open-close-timing",
			),
		);
		this.closeTimeout = setTimeout(() => {
			this.panel.style.display = "none";
		}, accordionOpenCloseTiming);
	}
	public toggle() {
		if (this.state === "open") {
			this.close();
		} else {
			this.open();
		}
	}
	public debug() {
		// eslint-disable-next-line no-console
		console.log({
			id: this.id,
			state: this.state,
			groupId: this.accordionGroup.getId(),
		});
	}
}

function enableAccordionFunctionality() {
	const accordionGroups = document.querySelectorAll<HTMLDivElement>(
		"[data-accordion-group]",
	);
	for (const accordionGroupElement of accordionGroups) {
		new AccordionGroup(accordionGroupElement);
	}
}

domReady(() => {
	enableAccordionFunctionality();
});
