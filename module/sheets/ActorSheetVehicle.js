import { Shadowrun6ActorSheet } from "./SR6ActorSheet.js";

/**
 * Sheet for Vehicle actors
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorSheetVehicle extends Shadowrun6ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["shadowrun6", "sheet", "actor"],
			template: "systems/shadowrun6-eden/templates/shadowrun6-actor-vehicle-sheet.html",
			width: 500,
			height: 800,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "overview" }],
			scrollY: [".items", ".attributes"],
			dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
		});
	}

}