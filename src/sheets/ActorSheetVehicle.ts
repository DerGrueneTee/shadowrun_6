import { Vehicle } from "../ActorTypes.js";
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
			width: 600,
			height: 800,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "overview" }],
			scrollY: [".items", ".attributes"],
			dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
			allVehicleUser: (game as Game).actors!.filter(actor => actor.type=="Player" || actor.type=="NPC")
		});
	}

	//-------------------------------------------------
  get template() {
//	 console.log("in template()");
//	if (this.actor && this.actor.isOwner) { console.log("is owner"); } else { console.log("is not owner");}
    const path = 'systems/shadowrun6-eden/templates/';
//    return `${path}shadowrun6-${this.item.data.type}-sheet.html`;
   return `${path}shadowrun6-actor-vehicle-sheet.html`;
  }

	activateListeners(html) {
		super.activateListeners(html);	
//	   if (this.actor && this.actor.isOwner) { console.log("is owner"); } else { console.log("is not owner");}

		// Owner Only Listeners
		if (this.actor.isOwner) {
			html.find('.vehicle-slower').click(ev => this._onDecelerate(ev, html));
			html.find('.vehicle-faster').click(ev => this._onAccelerate(ev, html));
		}
	}

	_onDecelerate(event, html) {
		console.log("_onDecelerate");
		let actorData:Vehicle = (this.actor.data.data as Vehicle);
		let currentSpeed = actorData.vehicle.speed;
		let newSpeed = currentSpeed - (( actorData.vehicle.offRoad)?actorData.accOff:actorData.accOn );
		if (newSpeed<0) newSpeed = 0;
		const field = "data.vehicle.speed";
		this.actor.update({ [field]: newSpeed });
	}

	_onAccelerate(event, html) {
		console.log("_onAccelerate");
		let actorData:Vehicle = (this.actor.data.data as Vehicle);
		let currentSpeed = actorData.vehicle.speed;
		let newSpeed = currentSpeed + (( actorData.vehicle.offRoad)?actorData.accOff:actorData.accOn );
		if (newSpeed>actorData.tspd) newSpeed = actorData.tspd;
		const field = "data.vehicle.speed";
		this.actor.update({ [field]: newSpeed });
	}
}