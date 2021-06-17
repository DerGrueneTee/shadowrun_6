/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorSheet extends ActorSheet {

	/** @overrride */
	getData() {
		let data = super.getData();
		data.config = CONFIG.SR6;
		return data;
	}

	/**
	 * Activate event listeners using the prepared sheet HTML
	 * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	 */
	activateListeners(html) {
		// Owner Only Listeners
		if (this.actor.isOwner) {
			// Roll Skill Checks
			html.find('.skill-roll').click(this._onRollSkillCheck.bind(this));
			html.find('.spell-roll').click(this._onRollSpellCheck.bind(this));
			html.find('.item-roll').click(this._onRollItemCheck.bind(this));
			html.find(".defense-roll").click(this._onCommonCheck.bind(this));
			html.find(".attributeonly-roll").click(this._onCommonCheck.bind(this));
			html.find(".calcPHYBar").on("input", this._redrawBar(html, "Phy", this.actor.data.data.physical));
			html.find(".calcStunBar").on("input", this._redrawBar(html, "Stun", this.actor.data.data.stun));
			html.find('.adeptpower-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.adeptpower"),
					type: "adeptpower",
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.martialartstyle-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.martialartstyle"),
					type: "martialartstyle",
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.quality-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.quality"),
					type: "quality",
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.metamagic-create').click(ev => {
				console.log("new metamagic");
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.metamagic"),
					type: "metamagic",
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.spell-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.spell"),
					type: "spell",
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.ritual-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.ritual"),
					type: "ritual",
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.skill-knowledge-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.skill.knowledge"),
					type: "skill",
					data: {
						genesisID: "knowledge"
					}
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.skill-language-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.skill.language"),
					type: "skill",
					data: {
						genesisID: "language",
						points: 1
					}
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.item-edit').click(ev => {
				const element = ev.currentTarget.closest(".item");
				const item = this.actor.items.get(element.dataset.itemId);
				item.sheet.render(true);
			});
			html.find('.item-delete').click(ev => {
				const itemId = this._getClosestData($(event.currentTarget), 'item-id');
				console.log("Delete item " + itemId)
				this.actor.deleteEmbeddedDocuments("Item", [itemId]);
			});
			html.find('[data-field]').change(event => {
				const element = event.currentTarget;
				let value = element.value;
				const itemId = this._getClosestData($(event.currentTarget), 'item-id');
				const field = element.dataset.field;
				console.log("Update field " + field + " with " + value);
				this.actor.items.get(itemId).update({ [field]: value });
			});
			html.find('[data-check]').click(event => {
				const element = event.currentTarget;
				console.log("Came here with checked=" + element.checked + "  and value=" + element.value);
				let value = element.checked;
				const itemId = this._getClosestData($(event.currentTarget), 'item-id');
				const field = element.dataset.check;
				console.log("Update field " + field + " with " + value);
				this.actor.items.get(itemId).update({ [field]: value });
			});
			//Collapsible
			html.find('.collapsible').click(event => {
				const element = event.currentTarget;
				const itemId = this._getClosestData($(event.currentTarget), 'item-id');
				const item = this.actor.items.get(itemId);
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
			html.find('.collapsible-skill').click(event => {
				const element = event.currentTarget;
				const skillId = this._getClosestData($(event.currentTarget), 'skill-id');
				const item = this.actor.data.data.skills[skillId];
				element.classList.toggle("open");
				let content = $(element.parentElement).find('.collapsible-content')[0];
				if (content.style.maxHeight) {
					content.style.maxHeight = null;
				} else {
					content.style.maxHeight = content.scrollHeight + "px";
				}
				let value = element.classList.contains("open") ? "open" : "closed";
				this.actor.setFlag("shadowrun6-eden", "collapse-state-"+skillId, value);
			});

			/*
			 * Drag & Drop
			 */
			$(".draggable").on("dragstart", event => {
				console.log("DRAG START");
				const itemId = event.currentTarget.dataset.itemId;
				if (itemId) {
					console.log("Item " + itemId + " dragged");
					const itemData = this.actor.data.items.find(el => el.id === itemId);
					event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
						type: "Item",
						data: itemData,
						actorId: this.actor.id
					}));
					event.stopPropagation();
					return;
				}

			}).attr('draggable', true);

		} else {
			html.find(".rollable").each((i, el) => el.classList.remove("rollable"));
		}

		// Handle default listeners last so system listeners are triggered first
		super.activateListeners(html);
	}

	//-----------------------------------------------------
	/**
	 * Handle rolling a Skill check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRollSkillCheck(event, html) {
		event.preventDefault();
		const skill     = event.currentTarget.dataset.skill;
		const skillSpec = event.currentTarget.dataset.skillspec;
		this.actor.rollSkill(skill, skillSpec);
	}

	_onRollItemCheck(event, html) {
		event.preventDefault();
		const item = event.currentTarget.dataset.itemId;
		this.actor.rollItem(item, { event: event });
	}

	_onRollSpellCheck(event, html) {
		event.preventDefault();
		const item = event.currentTarget.dataset.itemId;
		this.actor.rollSpell(item, { event: event });
	}

	_onCommonCheck(event, html) {
		console.log("onCommonCheck");
		event.preventDefault();
		const pool = event.currentTarget.dataset.pool;
		let classList = event.currentTarget.classList;
		let title;
		if (classList.contains("defense-roll") || classList.contains("attributeonly-roll")) {
			title = game.i18n.localize("shadowrun6.derived." + event.currentTarget.dataset.itemId);
		} else {
			title = game.i18n.localize("shadowrun6.rolltext." + event.currentTarget.dataset.itemId);
		}
		let dialogConfig;
		if (classList.contains("defense-roll")) {
			dialogConfig = {
				useModifier: true,
				useThreshold: false,
				buyHits: false
			};
		} else if (classList.contains("attributeonly-roll")) {
			dialogConfig = {
				useModifier: true,
				useThreshold: true,
				buyHits: true
			};
		} else {
			dialogConfig = {
				useModifier: true,
				useThreshold: true,
				buyHits: true,
				useWilddie: true
			};
		}
		this.actor.rollCommonCheck(pool, title, dialogConfig);
	}

	//-----------------------------------------------------
	_getClosestData(jQObject, dataName, defaultValue = "") {
		let value = jQObject.closest(`[data-${dataName}]`)?.data(dataName);
		return (value) ? value : defaultValue;
	}

	//-----------------------------------------------------
	_redrawBar(html, id, monitorAttribute) {
		//let vMax = parseInt(html.find("#data"+id+"Max")[0].value);
		//let vCur = parseInt(html.find("#data"+id+"Cur")[0].value);
		let perc = monitorAttribute.value / monitorAttribute.max * 100;
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
			let i = 0;
			while (i < monitorAttribute.max) {
				i++;
				var div = document.createElement("div");
				var text = document.createTextNode("\u00A0");
				if (i < monitorAttribute.max) {
					div.setAttribute("style", "flex: 1; border-right: solid black 1px;")
				} else {
					div.setAttribute("style", "flex: 1")
				}
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
					div.setAttribute("style", "flex: 1; border-right: solid black 1px; text-align:right;");
					div.appendChild(document.createTextNode(-(i / 3)));
				} else {
					div.setAttribute("style", "flex: 1")
					div.appendChild(document.createTextNode("\u00A0"));
				}
				myNode.insertBefore(div, myNode.childNodes[0]);
			}

		}
	}

	//-----------------------------------------------------
	_onRecalculatePhysicalBar(html) {
		console.log("LE editiert  " + html);
		let vMax = parseInt(html.find("#dataPhyMax")[0].value);
		console.log("vMax = " + vMax);
		let vCur = parseInt(html.find("#dataPhyCur")[0].value);
		console.log("vCur = " + vCur);
		let totalVer = vMax - vCur;  // Wieviel nach Verschnaufpause
		console.log("Damage = " + totalVer);
		let percVerz = totalVer / vMax * 100;
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
			let i = 0;
			while (i < vMax) {
				i++;
				var div = document.createElement("div");
				var text = document.createTextNode("\u00A0");
				if (i < vMax) {
					div.setAttribute("style", "flex: 1; border-right: solid black 1px;")
				} else {
					div.setAttribute("style", "flex: 1")
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
					div.appendChild(document.createTextNode(-(i / 3)));
				} else {
					div.setAttribute("style", "flex: 1")
					div.appendChild(document.createTextNode("\u00A0"));
				}
				myNode.insertBefore(div, myNode.childNodes[0]);
			}

		}
	}
}