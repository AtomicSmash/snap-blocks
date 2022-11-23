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
				typeof accordionElement.dataset.isInitiallyOpen === "string"
					? accordionElement.dataset.isInitiallyOpen === "true"
					: false;
			let isInitiallyOpen: boolean;
			if (this.allowMultipleOpenAccordions) {
				isInitiallyOpen = shouldTryToRemainOpen;
			} else {
				if (isFirstInitiallyOpenAccordion) {
					isInitiallyOpen = true;
					isFirstInitiallyOpenAccordion = false;
				} else {
					isInitiallyOpen = false;
				}
			}
			const accordion = new Accordion(accordionElement, this);
			if (!isInitiallyOpen) {
				accordion.close();
			}
			this.childAccordions.push(accordion);
		}
	}
}

class Accordion {
	private id: string;
	private state: "open" | "collapsed";
	private accordionGroup: AccordionGroup;
	public trigger: HTMLButtonElement;
	public panel: HTMLDivElement;

	constructor(accordion: HTMLElement, accordionGroup: AccordionGroup) {
		const accordionId = accordion.id;
		if (accordionId === undefined || accordionId === "") {
			throw new Error("Failed to get ID of accordion.");
		}
		this.id = accordionId;
		this.state = "open";
		const trigger = document.getElementById(
			`${accordionId}-trigger`
		) as HTMLButtonElement | null;
		if (!trigger) {
			throw new Error("Unable to determine the accordions trigger button.");
		}
		this.trigger = trigger;
		const panel = document.getElementById(
			`${accordionId}-panel`
		) as HTMLDivElement | null;
		if (!panel) {
			throw new Error("Unable to determine the accordions content panel.");
		}
		this.panel = panel;
		this.accordionGroup = accordionGroup;
		this.trigger.addEventListener("click", () => {
			this.toggle();
		});
	}
	public getId() {
		return this.id;
	}
	public getState() {
		return this.state;
	}
	public open() {
		this.state = "open";
		this.panel.removeAttribute("hidden");
		this.panel.setAttribute("data-state", "open");
		this.trigger.setAttribute("aria-expanded", "true");
		this.trigger.setAttribute("data-state", "open");
		if (!this.accordionGroup.allowMultipleOpenAccordions) {
			this.accordionGroup.closeAllAccordions();
		}
	}
	public close() {
		this.state = "collapsed";
		this.panel.setAttribute("hidden", "");
		this.panel.setAttribute("data-state", "collapsed");
		this.trigger.setAttribute("aria-expanded", "false");
		this.trigger.setAttribute("data-state", "collapsed");
	}
	public toggle() {
		if (this.state === "open") {
			this.close();
		} else {
			this.open();
		}
	}
}

function enableAccordionFunctionality() {
	const accordionGroups = document.querySelectorAll<HTMLDivElement>(
		"[data-accordion-group]"
	);
	for (const accordionGroupElement of accordionGroups) {
		new AccordionGroup(accordionGroupElement);
	}
}

domReady(() => {
	enableAccordionFunctionality();
});
