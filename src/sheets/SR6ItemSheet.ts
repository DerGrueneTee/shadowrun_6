import { SR6Config } from "../config.js";
import { GenesisData } from "../ItemTypes.js";

interface SR6ItemSheetData extends ItemSheet.Data {
	config: SR6Config;
}
function getSystemData(obj: any): any {
	if ( (game as any).release.generation >= 10) return obj.system;
	return obj.data.data;
}
function getActorData(obj: any): any {
	if ( (game as any).release.generation >= 10) return obj;
	return obj.data;
}

export class SR6ItemSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["shadowrun6", "sheet", "item"],
			width  : 550
		});
	}

	get template() {
		console.log("in template()", getSystemData(this.item));
		const path = "systems/shadowrun6-eden/templates/item/";
		console.log(`${path}shadowrun6-${getActorData(this.item).type}-sheet.html`);
		if (this.isEditable) {
			console.log("ReadWrite sheet ");
			return `${path}shadowrun6-${getActorData(this.item).type}-sheet.html`;
		} else {
			console.log("ReadOnly sheet", this);
			let genItem: GenesisData = getSystemData(this.item) as GenesisData;
			(this.item as any).descHtml = (game as Game).i18n.localize(getActorData(this.item).type + "." + genItem.genesisID + ".desc");
			(getActorData(this.item) as any).descHtml2 = (game as Game).i18n.localize(getActorData(this.item).type + "." + genItem.genesisID + ".desc");
			return `${path}shadowrun6-${getActorData(this.item).type}-sheet-ro.html`;
		}
	}

	/** @overrride */
	getData() {
		let data = super.getData();
		(data as SR6ItemSheetData).config = CONFIG.SR6;
		return data;
	}

	/**
	 * Activate event listeners using the prepared sheet HTML
	 * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	 */
	activateListeners(html) {
		super.activateListeners(html);
		if (this.actor && this.actor.isOwner) {
			console.log("is owner");
		} else {
			console.log("is not owner");
		}

		if (!this.isEditable) {
			let x = html.find(".data-desc");
			console.log("Replace descriptions for " + this.object.type + " and ", getSystemData(this.object));
			switch (this.object.type) {
				case "quality":
					x[0].innerHTML = (game as Game).i18n.localize("quality." + (getSystemData(this.object) as GenesisData).genesisID + ".desc");
					break;
				case "gear":
					x[0].innerHTML = (game as Game).i18n.localize("item." + (getSystemData(this.object) as GenesisData).genesisID + ".desc");
					break;
				default:
					x[0].innerHTML = (game as Game).i18n.localize(this.object.type + "." + (getSystemData(this.object) as GenesisData).genesisID + ".desc");
			}
		}

		// Owner Only Listeners
		if (this.actor && this.actor.isOwner) {
			html.find("[data-field]").change(async (event) => {
				const element = event.currentTarget;
				let value;
				if (element.type == "checkbox") {
					value = element.checked;
				} else {
					value = element.value;
				}
				const itemId: string = getActorData(this.object)._id!;
				const field = element.dataset.field;
				console.log("Try to update field '" + field + "' of item " + itemId + " with value " + value, this.item);
				if (element.type=="number" || (element.dataset && element.dataset.dtype && element.dataset.dtype=="Number")) {
					value = parseInt (element.value);
				}
				if (this.item) {
					await this.item.update({ [field]: value });
				} else {
					await this.actor!.items.get(itemId)!.update({ [field]: value });
				}
			});
		} else if (this.isEditable) {
			html.find("[data-field]").change((event) => {
				const element = event.currentTarget;
				let value;
				if (element.type == "checkbox") {
					value = element.checked;
				} else {
					value = element.value;
				}
				const field = element.dataset.field;
				const arrayId = element.dataset.arrayid;
				if (arrayId) {
					this.object.update({ [field]: [, , 3, ,] });
				} else {
					this.object.update({ [field]: value });
				}
			});
		}
		html.find("[data-array-field]").change((event) => {
			const element = event.currentTarget;
			const idx = parseInt((<any>$(event.currentTarget)).closestData("index", "0"));
			const array = (<any>$(event.currentTarget)).closestData("array");
			const field = (<any>$(event.currentTarget)).closestData("array-field");
			let newValue: any[][] = [];

			if (!(idx >= 0 && array !== "")) return;

			/* Duplicate the data from the object. Sets null & NaN to 0 */
			if (field) {
				newValue = duplicate(
					//array.split(".").reduce(function (prev, curr) {
					//	return prev ? prev[curr] : null;
					//}, (this.object as any).system) //getActorData(this.object))
					(this.object as any).system[array.split(".")[1]]
				);
				newValue[idx][field] = element.value;
			} else {
				newValue = duplicate(
					//array.split(".").reduce(function (prev, curr) {
					//	return prev ? prev[curr] : null;
					//}, (this.object as any).system)
					(this.object as any).system[array.split(".")[1]]
				);
				newValue[idx] = element.value;
			}

			/* Update the value of 'array' with newValue */
			this.object.update({ [array]: newValue });
		});
	}
}
