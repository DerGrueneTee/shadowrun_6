import { Lifeform, Monitor, Skill } from "../ActorTypes.js";
import { SR6Config } from "../config.js";
import { ComplexForm, Gear, GenesisData, Spell, Weapon } from "../ItemTypes.js";
import { WeaponRoll, SkillRoll, SpellRoll, PreparedRoll, RollType, MatrixActionRoll, ComplexFormRoll } from "../dice/RollTypes.js";
import { Shadowrun6Actor } from "../Shadowrun6Actor.js";

interface SR6ActorSheetData extends ActorSheet.Data {
	config: SR6Config;
}

function isLifeform(obj: any): obj is Lifeform {
	return obj.attributes != undefined;
}
function isGear(obj: any): obj is Gear {
	return obj.skill != undefined;
}
function isWeapon(obj: any): obj is Weapon {
	return obj.attackRating != undefined;
}
function isSpell(obj: any): obj is Spell {
	return obj.drain != undefined;
}

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorSheet extends ActorSheet {
	/** @overrride */
	getData() {
		let data = super.getData();
		//console.log("getData1() " , data);
		(data as SR6ActorSheetData).config = CONFIG.SR6;
		//console.log("getData2() " , data);
		//console.log("CONFIG.SR6 " , CONFIG.SR6);
		return data;
	}

	get template() {
		console.log("in template()", this.actor.data.data);
		const path = "systems/shadowrun6-eden/templates/actor/";
		console.log(`${path}shadowrun6-${this.actor.data.type}-sheet.html`);
		if (this.isEditable) {
			console.log("ReadWrite sheet ");
			return `${path}shadowrun6-${this.actor.data.type}-sheet.html`;
		} else {
			console.log("ReadOnly sheet", this);
			let genItem: GenesisData = this.actor.data.data as GenesisData;
			(this.actor as any).descHtml = (game as Game).i18n.localize(this.actor.data.type + "." + genItem.genesisID + ".desc");
			(this.actor.data as any).descHtml2 = (game as Game).i18n.localize(this.actor.data.type + "." + genItem.genesisID + ".desc");
			return `${path}shadowrun6-${this.actor.data.type}-sheet-ro.html`;
		}
	}

	/**
	 * Activate event listeners using the prepared sheet HTML
	 * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	 */
	activateListeners(html) {
		// Owner Only Listeners
		if (this.actor.isOwner) {
			html.find(".calcPHYBar").on("input", this._redrawBar(html, "Phy", (this.actor.data.data as Lifeform).physical));
			html.find(".calcStunBar").on("input", this._redrawBar(html, "Stun", (this.actor.data.data as Lifeform).stun));

			// Roll Skill Checks
			html.find(".skill-roll").click(this._onRollSkillCheck.bind(this));
			html.find(".spell-roll").click(this._onRollSpellCheck.bind(this));
			html.find(".ritual-roll").click(this._onRollRitualCheck.bind(this));
			html.find(".item-roll").click(this._onRollItemCheck.bind(this));
			html.find(".defense-roll").click(this._onCommonCheck.bind(this));
			html.find(".matrix-roll").click(this._onMatrixAction.bind(this));
			html.find(".complexform-roll").click(this._onRollComplexFormCheck.bind(this));
			html.find(".attributeonly-roll").click(this._onCommonCheck.bind(this));

			this.activateCreationListener(html);

			html.find(".item-delete").click((event) => {
				const itemId = this._getClosestData($(event.currentTarget), "item-id");
				console.log("Delete item " + itemId);
				this.actor.deleteEmbeddedDocuments("Item", [itemId]);
			});
			html.find("[data-field]").change((event) => {
				const element = event.currentTarget;
				let value = element.value;
				const itemId = this._getClosestData($(event.currentTarget), "item-id");
				const field = element.dataset.field;
				if (itemId) {
					console.log("Update item " + itemId + " field " + field + " with " + value);
					let item = this.actor.items.get(itemId);
					if (item) item.update({ [field]: value });
				} else {
					console.log("Update actor field " + field + " with " + value);
					this.actor.update({ [field]: value });
				}
			});
			html.find("[data-check]").click((event) => {
				const element = event.currentTarget;
				console.log("Came here with checked=" + element.checked + "  and value=" + element.value);
				let value = element.checked;
				const itemId = this._getClosestData($(event.currentTarget), "item-id");
				const field = element.dataset.check;
				if (itemId) {
					console.log("Update field " + field + " with " + value);
					let item = this.actor.items.get(itemId);
					if (item) item.update({ [field]: value });
				} else {
					console.log("Update actor field " + field + " with " + value);
					this.actor.update({ [field]: value });
				}
			});
			//Collapsible
			html.find(".collapsible").click((event) => {
				const element = event.currentTarget;
				const itemId = this._getClosestData($(event.currentTarget), "item-id");
				const item = this.actor.items.get(itemId);
				if (!item) return;
				//				console.log("Collapsible: old styles are '"+element.classList+"'' and flag is "+item.getFlag("shadowrun6-eden","collapse-state"));
				element.classList.toggle("open");
				let content = element.parentElement.parentElement.nextElementSibling.firstElementChild.firstElementChild;
				if (content.style.maxHeight) {
					content.style.maxHeight = null;
				} else {
					content.style.maxHeight = content.scrollHeight + "px";
				}
				//				console.log("Collapsible: temp style are '"+element.classList);
				let value = element.classList.contains("open") ? "open" : "closed";
				//				console.log("Update flag 'collapse-state' with "+value);
				//				item.data.flags["shadowrun6-eden"]["collapse-state"] = value;
				item.setFlag("shadowrun6-eden", "collapse-state", value);
				//				console.log("Collapsible: new styles are '"+element.classList+"' and flag is "+item.getFlag("shadowrun6-eden","collapse-state"));
			});
			//Collapsible for lists
			html.find(".collapsible-skill").click((event) => {
				const element = event.currentTarget;
				const skillId = this._getClosestData($(event.currentTarget), "skill-id");
				const item = (this.actor.data.data as Lifeform).skills[skillId];
				element.classList.toggle("open");
				let content = $(element.parentElement).find(".collapsible-content")[0];
				if (content.style.maxHeight) {
					content.style.maxHeight = "";
				} else {
					content.style.maxHeight = content.scrollHeight + "px";
				}
				let value = element.classList.contains("open") ? "open" : "closed";
				this.actor.setFlag("shadowrun6-eden", "collapse-state-" + skillId, value);
			});
			//Collapsible
			html.find("select.contdrolled").change((event) => {
				const element = event.currentTarget;
				const itemId = this._getClosestData($(event.currentTarget), "item-id");
				console.log("SELECT ", element);
				console.log("SELECT2", event);
				console.log("SELECT3", event.target.value);
				console.log("-> itemId ", itemId);
				console.log("-> ds ", element.dataset);
			});

			/*
			 * Drag & Drop
			 */
			$(".draggable")
				.on("dragstart", (event) => {
					console.log("DRAG START");
					const itemId = event.currentTarget.dataset.itemId;
					if (itemId) {
						console.log("Item " + itemId + " dragged");
						const itemData = this.actor.data.items.find((el) => el.id === itemId);
						event.originalEvent!.dataTransfer!.setData(
							"text/plain",
							JSON.stringify({
								type   : "Item",
								data   : itemData,
								actorId: this.actor.id
							})
						);
						event.stopPropagation();
						return;
					}
				})
				.attr("draggable", "true");
		} else {
			html.find(".rollable").each((i, el) => el.classList.remove("rollable"));
		}

		// Handle default listeners last so system listeners are triggered first
		super.activateListeners(html);
	}

	activateCreationListener(html) {
		console.log("activateCreationListener");
		html.find(".adeptpower-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.adeptpower"),
				type: "adeptpower"
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".martialartstyle-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.martialartstyle"),
				type: "martialartstyle"
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".quality-create").click((ev) => this._onCreateNewEmbeddedItem("quality"));
		html.find(".echo-create").click((ev) => this._onCreateNewEmbeddedItem("echo"));
		html.find(".contact-create").click((ev) => this._onCreateNewEmbeddedItem("contact"));
		html.find(".sin-create").click((ev) => this._onCreateNewEmbeddedItem("sin"));
		html.find(".lifestyle-create").click((ev) => this._onCreateNewEmbeddedItem("lifestyle"));
		html.find(".complexform-create").click((ev) => this._onCreateNewEmbeddedItem("complexform"));
		html.find(".metamagic-create").click((ev) => this._onCreateNewEmbeddedItem("metamagic"));
		html.find(".spell-create").click((ev) => this._onCreateNewEmbeddedItem("spell"));
		html.find(".ritual-create").click((ev) => this._onCreateNewEmbeddedItem("ritual"));
		html.find(".focus-create").click((ev) => this._onCreateNewEmbeddedItem("focus"));
		html.find(".weapon-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.weapon"),
				type: "gear",
				data: {
					type: "WEAPON_FIREARMS"
				}
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".ELECTRONICS-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "ELECTRONICS"));
		html.find(".CHEMICALS-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "CHEMICALS"));
		html.find(".BIOLOGY-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "BIOLOGY"));
		html.find(".SURVIVAL-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "SURVIVAL"));
		html.find(".armor-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "ARMOR"));
		html.find(".ammunition-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "AMMUNITION"));
		html.find(".bodyware-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "CYBERWARE"));
		html.find(".close-weapon-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.weaponclose"),
				type: "gear",
				data: {
					type: "WEAPON_CLOSE_COMBAT"
				}
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".martialart-style-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.martialartstyle"),
				type: "martialartstyle",
				data: {
					genesisID: this._create_UUID()
				}
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".martialart-tech-create").click((ev) => {
			const element = ev.currentTarget.closest(".item");
			const styleId = element.dataset.styleId;
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.martialarttech"),
				type: "martialarttech",
				data: {
					style: styleId
				}
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".skill-knowledge-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.skill.knowledge"),
				type: "skill",
				data: {
					genesisID: "knowledge"
				}
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".skill-language-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.skill.language"),
				type: "skill",
				data: {
					genesisID: "language",
					points   : 1
				}
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".matrix-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.matrix"),
				type: "gear",
				data: {
					genesisID: this._create_UUID(),
					type     : "ELECTRONICS",
					subtype  : "COMMLINK"
				}
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".vehicle-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.vehicles"),
				type: "gear",
				data: {
					genesisID: this._create_UUID(),
					type     : "VEHICLES",
					subtype  : "CARS"
				}
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".drone-create").click((ev) => {
			const itemData = {
				name: (game as Game).i18n.localize("shadowrun6.newitem.drones"),
				type: "gear",
				data: {
					genesisID: this._create_UUID(),
					type     : "DRONES",
					subtype  : "SMALL_DRONES"
				}
			};
			return this.actor.createEmbeddedDocuments("Item", [itemData]);
		});
		html.find(".item-edit").click((ev) => {
			const element = ev.currentTarget.closest(".item");
			const item: Item | undefined = this.actor.items.get(element.dataset.itemId);
			console.log("edit ", item);
			if (!item) {
				throw new Error("Item is null");
			}

			if (item.sheet) {
				item.sheet.render(true);
			}
		});
	}

	//-----------------------------------------------------
	_onCreateNewEmbeddedItem(type: string, itemtype: string | null = null) {
		let nameType: string = itemtype ? itemtype.toLowerCase() : type.toLowerCase();
		let itemData = {
			name: (game as Game).i18n.localize("shadowrun6.newitem." + nameType),
			type: type
		};
		if (itemtype) {
			itemData = mergeObject(itemData, {
				data: {
					type: itemtype
				}
			});
		}
		return this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

	//-----------------------------------------------------
	_getClosestData(jQObject, dataName, defaultValue = "") {
		let value = jQObject.closest(`[data-${dataName}]`)?.data(dataName);
		return value ? value : defaultValue;
	}

	//-----------------------------------------------------
	_setDamage(html, i, monitorAttribute, id, event) {
		if (!isLifeform(this.actor.data.data)) return;
		switch (event.target.parentNode.getAttribute("id")) {
			case "barPhyBoxes":
				console.log("setDamage (physical health to " + event.currentTarget.dataset.value + ")");
				//Allow setting zero health by clicking again
				if ((this.actor.data.data.physical.dmg == monitorAttribute.max - 1) == i) {
					this.actor.update({ [`data.physical.dmg`]: monitorAttribute.max });
				} else {
					this.actor.update({ [`data.physical.dmg`]: monitorAttribute.max - i });
				}
				break;
			case "barStunBoxes":
				console.log("setDamage (stun health to " + event.currentTarget.dataset.value + ")");
				//Allow setting zero health by clicking again
				if ((this.actor.data.data.stun.dmg == monitorAttribute.max - 1) == i) {
					this.actor.update({ [`data.stun.dmg`]: monitorAttribute.max });
				} else {
					this.actor.update({ [`data.stun.dmg`]: monitorAttribute.max - i });
				}
				break;
		}
	}

	//-----------------------------------------------------
	_redrawBar(html, id, monitorAttribute: Monitor) {
		if (!monitorAttribute || !monitorAttribute.value) return;
		//let vMax = parseInt(html.find("#data"+id+"Max")[0].value);
		//let vCur = parseInt(html.find("#data"+id+"Cur")[0].value);
		let perc = (monitorAttribute.value / monitorAttribute.max) * 100;
		if (html.find("#bar" + id + "Cur").length == 0) {
			return;
		}
		html.find("#bar" + id + "Cur")[0].style.width = perc + "%";

		let myNode = html.find("#bar" + id + "Boxes")[0];
		// Only change nodes when necessary
		if (myNode.childElementCount != monitorAttribute.max) {
			// The energy bar
			// Remove previous boxes
			while (myNode.firstChild) {
				myNode.removeChild(myNode.lastChild);
			}
			// Add new ones
			let i: number = 0;
			while (i < monitorAttribute.max) {
				i++;
				var div = document.createElement("div");
				var text = document.createTextNode("\u00A0");
				if (i < monitorAttribute.max) {
					div.setAttribute("style", "flex: 1; border-right: solid black 1px;");
				} else {
					div.setAttribute("style", "flex: 1");
				}
				div.addEventListener("click", this._setDamage.bind(this, html, i, monitorAttribute, id));
				div.appendChild(text);
				myNode.appendChild(div);
			}

			// The scale
			myNode = html.find("#bar" + id + "Scale")[0];
			while (myNode.firstChild) {
				myNode.removeChild(myNode.lastChild);
			}
			// Add new
			i = 0;
			while (i < monitorAttribute.max) {
				i++;
				var div = document.createElement("div");
				if (i % 3 == 0) {
					let minus: number = -(i / 3);
					div.setAttribute("style", "flex: 1; border-right: solid black 1px; text-align:right;");
					div.appendChild(document.createTextNode(minus.toString()));
				} else {
					div.setAttribute("style", "flex: 1");
					div.appendChild(document.createTextNode("\u00A0"));
				}
				myNode.insertBefore(div, myNode.childNodes[0]);
			}
		}
	}

	_create_UUID() {
		var dt = new Date().getTime();
		var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = (dt + Math.random() * 16) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
		});
		return uuid;
	}

	//-----------------------------------------------------
	_onRecalculatePhysicalBar(html) {
		console.log("LE editiert  " + html);
		let vMax = parseInt(html.find("#dataPhyMax")[0].value);
		console.log("vMax = " + vMax);
		let vCur = parseInt(html.find("#dataPhyCur")[0].value);
		console.log("vCur = " + vCur);
		let totalVer = vMax - vCur; // Wieviel nach Verschnaufpause
		console.log("Damage = " + totalVer);
		let percVerz = (totalVer / vMax) * 100;
		console.log("Percent = " + percVerz);
		html.find("#barPhyCur")[0].style.width = percVerz + "%";
		//	    this.object.data.data.le.cur = totalCur;

		let myNode = html.find("#barPhyBoxes")[0];
		// Only change nodes when necessary
		if (myNode.childElementCount != vMax) {
			// The energy bar
			// Remove previous boxes
			while (myNode.firstChild) {
				myNode.removeChild(myNode.lastChild);
			}
			// Add new ones
			let i: number = 0;
			while (i < vMax) {
				i++;
				var div = document.createElement("div");
				var text = document.createTextNode("\u00A0");
				if (i < vMax) {
					div.setAttribute("style", "flex: 1; border-right: solid black 1px;");
				} else {
					div.setAttribute("style", "flex: 1");
				}
				div.appendChild(text);
				myNode.appendChild(div);
			}

			// The scale
			myNode = html.find("#barPhyScale")[0];
			while (myNode.firstChild) {
				myNode.removeChild(myNode.lastChild);
			}
			// Add new
			i = 0;
			while (i < vMax) {
				i++;
				var div = document.createElement("div");
				if (i % 3 == 0) {
					div.setAttribute("style", "flex: 1; border-right: solid black 1px; text-align:right;");
					div.appendChild(document.createTextNode((-(i / 3)).toString()));
				} else {
					div.setAttribute("style", "flex: 1");
					div.appendChild(document.createTextNode("\u00A0"));
				}
				myNode.insertBefore(div, myNode.childNodes[0]);
			}
		}
	}

	//-----------------------------------------------------
	_onCommonCheck(event, html) {
		console.log("onCommonCheck");
		event.preventDefault();

		let roll: PreparedRoll = new PreparedRoll();
		roll.pool = event.currentTarget.dataset.pool;
		roll.rollType = RollType.Common;

		let classList = event.currentTarget.classList;
		if (classList.contains("defense-roll")) {
			roll.actionText = (game as Game).i18n.localize("shadowrun6.defense." + event.currentTarget.dataset.itemId);
		} else if (classList.contains("attributeonly-roll")) {
			roll.actionText = (game as Game).i18n.localize("shadowrun6.derived." + event.currentTarget.dataset.itemId);
		} else {
			roll.actionText = (game as Game).i18n.localize("shadowrun6.rolltext." + event.currentTarget.dataset.itemId);
		}
		let dialogConfig: any;
		if (classList.contains("defense-roll")) {
			roll.allowBuyHits = false;
			dialogConfig = {
				useModifier : true,
				useThreshold: false
			};
		} else if (classList.contains("attributeonly-roll")) {
			roll.allowBuyHits = true;
			dialogConfig = {
				useModifier : true,
				useThreshold: true
			};
		} else {
			roll.allowBuyHits = true;
			roll.useWildDie = 1;
			dialogConfig = {
				useModifier : true,
				useThreshold: true
			};
		}
		(this.actor as Shadowrun6Actor).rollCommonCheck(roll, dialogConfig);
	}

	//-----------------------------------------------------
	/**
	 * Handle rolling a Skill check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRollSkillCheck(event: Event, html) {
		console.log("onRollSkillCheck");
		event.preventDefault();
		if (!event.currentTarget) return;
		if (!(event.currentTarget as any).dataset) return;
		let dataset: any = (event.currentTarget as any).dataset;
		const skillId: string = dataset.skill;
		let roll: SkillRoll = new SkillRoll(this.actor.data.data as Lifeform, skillId);
		roll.skillSpec = dataset.skillspec;
		if (dataset.threshold) roll.threshold = dataset.threshold;
		roll.attrib = dataset.attrib;

		console.log("onRollSkillCheck before ", roll);
		(this.actor as Shadowrun6Actor).rollSkill(roll);
	}

	//-----------------------------------------------------
	_onRollItemCheck(event, html) {
		console.log("_onRollItemCheck");
		event.preventDefault();
		const attacker: Lifeform = this.actor.data.data as Lifeform;
		const itemId = event.currentTarget.dataset.itemId;

		let item: Item | undefined = this.actor.items.get(itemId);
		if (!item) {
			throw new Error("onRollItemCheck for non-existing item");
		}
		if (!isGear(item.data.data)) {
			throw new Error("onRollItemCheck: No skill for item");
		}
		if (isWeapon(item.data.data)) {
			console.log("is weapon", item);
		}
		const gear: Gear = item.data.data;

		let roll: WeaponRoll = new WeaponRoll(attacker, item, itemId, gear);
		roll.useWildDie = gear.wild ? 1 : 0;
		console.log("_onRollItemCheck before ", roll);
		(this.actor as Shadowrun6Actor).rollItem(roll);
	}

	//-----------------------------------------------------
	_onRollSpellCheck(event: Event, html) {
		console.log("_onRollSpellCheck");
		event.preventDefault();
		if (!event.currentTarget) return;
		if (!(event.currentTarget as any).dataset) return;
		const caster: Lifeform = this.actor.data.data as Lifeform;
		const itemId: string = (event.currentTarget as any).dataset.itemId;

		let item: Item | undefined = this.actor.items.get(itemId);
		if (!item) {
			throw new Error("_onRollSpellCheck for non-existing item");
		}
		const skill: Skill = caster.skills["sorcery"];
		let spellRaw = this.actor.items.get(itemId);
		if (!spellRaw) {
			console.log("No such item: " + itemId);
			return;
		}
		const spell: Spell = spellRaw.data.data as Spell;
		let roll: SpellRoll = new SpellRoll(caster, item, itemId, spell);
		roll.skillSpec = "spellcasting";
		(this.actor as Shadowrun6Actor).rollSpell(roll, false);
	}

	//-----------------------------------------------------
	_onRollRitualCheck(event, html) {
		event.preventDefault();
		const item = event.currentTarget.dataset.itemId;
		(this.actor as Shadowrun6Actor).rollSpell(item, true);
	}

	//-----------------------------------------------------
	_onMatrixAction(event, html) {
		event.preventDefault();
		console.log("onMatrixAction ", event.currentTarget.dataset);
		if (!event.currentTarget) return;
		if (!(event.currentTarget as any).dataset) return;
		const attacker: Lifeform = this.actor.data.data as Lifeform;

		const matrixId = event.currentTarget.dataset.matrixId;
		const matrixAction = CONFIG.SR6.MATRIX_ACTIONS[matrixId];
		let roll: MatrixActionRoll = new MatrixActionRoll(attacker, matrixAction);
		console.log("_onMatrixAction before ", roll);
		(this.actor as Shadowrun6Actor).performMatrixAction(roll);
	}

	//-----------------------------------------------------
	_onRollComplexFormCheck(event, html) {
		console.log("_onRollComplexFormCheck");
		event.preventDefault();
		if (!event.currentTarget) return;
		if (!(event.currentTarget as any).dataset) return;
		const caster: Lifeform = this.actor.data.data as Lifeform;
		const itemId: string = (event.currentTarget as any).dataset.itemId;

		let item: Item | undefined = this.actor.items.get(itemId);
		if (!item) {
			throw new Error("_onRollComplexFormCheck for non-existing item");
		}
		let formRaw = this.actor.items.get(itemId);
		if (!formRaw) {
			console.log("No such item: " + itemId);
			return;
		}
		const cform: ComplexForm = formRaw.data.data as ComplexForm;
		let roll: ComplexFormRoll = new ComplexFormRoll(caster, item, itemId, cform);
		roll.skillSpec = "complex_forms";
		(this.actor as Shadowrun6Actor).rollComplexForm(roll);
	}
}
