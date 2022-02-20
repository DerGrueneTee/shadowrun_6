import { Shadowrun6ActorSheet } from "./SR6ActorSheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorSheetPC extends Shadowrun6ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["shadowrun6", "sheet", "actor"],
			template: "systems/shadowrun6-eden/templates/shadowrun6-actor-sheet.html",
			width: 830,
			height: 900,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "basics" }],
			scrollY: [".biography", ".items", ".attributes"],
			dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
		});
	}

}