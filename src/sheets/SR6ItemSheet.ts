import { SR6Config } from "../config.js";
import { GenesisData } from "../ItemTypes.js";

interface SR6ItemSheetData extends ItemSheet.Data {
	config: SR6Config;
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
		console.log("in template()", this.item.data.data);
		const path = "systems/shadowrun6-eden/templates/item/";
		console.log(`${path}shadowrun6-${this.item.data.type}-sheet.html`);
		if (this.isEditable) {
			console.log("ReadWrite sheet ");
			return `${path}shadowrun6-${this.item.data.type}-sheet.html`;
		} else {
			console.log("ReadOnly sheet", this);
			let genItem: GenesisData = this.item.data.data as GenesisData;
			(this.item as any).descHtml = (game as Game).i18n.localize(this.item.data.type + "." + genItem.genesisID + ".desc");
			(this.item.data as any).descHtml2 = (game as Game).i18n.localize(this.item.data.type + "." + genItem.genesisID + ".desc");
			return `${path}shadowrun6-${this.item.data.type}-sheet-ro.html`;
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
			console.log("Replace descriptions for " + this.object.type + " and ", this.object.data.data);
			switch (this.object.type) {
				case "quality":
					x[0].innerHTML = (game as Game).i18n.localize("quality." + (this.object.data.data as GenesisData).genesisID + ".desc");
					break;
				case "gear":
					x[0].innerHTML = (game as Game).i18n.localize("item." + (this.object.data.data as GenesisData).genesisID + ".desc");
					break;
				default:
					x[0].innerHTML = (game as Game).i18n.localize(this.object.type + "." + (this.object.data.data as GenesisData).genesisID + ".desc");
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
				const itemId: string = this.object.data._id!;
				const field = element.dataset.field;
				console.log("Try to update field '" + field + "' of item " + itemId + " with value " + value, this.item);
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
			if (field) {
				newValue = duplicate(
					array.split(".").reduce(function (prev, curr) {
						return prev ? prev[curr] : null;
					}, this.object.data)
				);
				newValue[idx][field] = element.value;
			} else {
				newValue = duplicate(
					array.split(".").reduce(function (prev, curr) {
						return prev ? prev[curr] : null;
					}, this.object.data)
				);
				newValue[idx] = element.value;
			}
			this.object.update({ [array]: newValue });
		});
	}
}
