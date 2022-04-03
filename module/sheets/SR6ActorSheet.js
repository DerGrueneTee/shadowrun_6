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
			html.find('.ritual-roll').click(this._onRollRitualCheck.bind(this));
			html.find('.item-roll').click(this._onRollItemCheck.bind(this));
			html.find(".defense-roll").click(this._onCommonCheck.bind(this));
			html.find(".matrix-roll").click(this._onMatrixAction.bind(this));
			html.find('.complexform-roll').click(this._onRollComplexFormCheck.bind(this));
			html.find(".attributeonly-roll").click(this._onCommonCheck.bind(this));
            html.find(".heal-roll").click(this._onHealCheck.bind(this));
			html.find(".calcPHYBar").on("input", this._redrawBar(html, "Phy", this.actor.data.data.physical));
			html.find(".calcStunBar").on("input", this._redrawBar(html, "Stun", this.actor.data.data.stun));
			html.find(".calcOverflowBar").on("input", this._redrawBar(html, "Overflow", this.actor.data.data.overflow));
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
			html.find('.quality-create').click(ev => this._onCreateNewEmbeddedItem("quality"));
			html.find('.echo-create').click(ev => this._onCreateNewEmbeddedItem("echo"));
			html.find('.contact-create').click(ev => this._onCreateNewEmbeddedItem("contact"));
			html.find('.sin-create').click(ev => this._onCreateNewEmbeddedItem("sin"));
			html.find('.lifestyle-create').click(ev => this._onCreateNewEmbeddedItem("lifestyle"));
			html.find('.complexform-create').click(ev => this._onCreateNewEmbeddedItem("complexform"));
			html.find('.metamagic-create').click(ev => this._onCreateNewEmbeddedItem("metamagic"));
			html.find('.spell-create').click(ev => this._onCreateNewEmbeddedItem("spell"));
			html.find('.ritual-create').click(ev => this._onCreateNewEmbeddedItem("ritual"));
			html.find('.focus-create').click(ev => this._onCreateNewEmbeddedItem("focus"));
			html.find('.weapon-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.weapon"),
					type: "gear",
					data: {
						type: "WEAPON_FIREARMS"
					}
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.ELECTRONICS-create').click(ev => this._onCreateNewEmbeddedItem("gear","ELECTRONICS"));
			html.find('.CHEMICALS-create').click(ev => this._onCreateNewEmbeddedItem("gear","CHEMICALS"));
			html.find('.BIOLOGY-create').click(ev => this._onCreateNewEmbeddedItem("gear","BIOLOGY"));
			html.find('.SURVIVAL-create').click(ev => this._onCreateNewEmbeddedItem("gear","SURVIVAL"));
			html.find('.armor-create').click(ev => this._onCreateNewEmbeddedItem("gear","ARMOR"));
			html.find('.ammunition-create').click(ev => this._onCreateNewEmbeddedItem("gear","AMMUNITION"));
			html.find('.bodyware-create').click(ev => this._onCreateNewEmbeddedItem("gear","CYBERWARE"));
			html.find('.close-weapon-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.weaponclose"),
					type: "gear",
					data: {
						type: "WEAPON_CLOSE_COMBAT"
					}
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.martialart-style-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.martialartstyle"),
					type: "martialartstyle",
					data: {
						genesisID: this._create_UUID()
					}
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.martialart-tech-create').click(ev => {
				const element = ev.currentTarget.closest(".item");
				const styleId = element.dataset.styleId;
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.martialarttech"),
					type: "martialarttech",
					data: {
						style: styleId,
					}
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
			html.find('.matrix-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.matrix"),
					type: "gear",
					data: {
						genesisID: this._create_UUID(),
						type: "ELECTRONICS",
						subtype: "COMMLINK"
					}
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.vehicle-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.vehicles"),
					type: "gear",
					data: {
						genesisID: this._create_UUID(),
						type: "VEHICLES",
						subtype: "CARS"
					}
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.drone-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.newitem.drones"),
					type: "gear",
					data: {
						genesisID: this._create_UUID(),
						type: "DRONES",
						subtype: "SMALL_DRONES"
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
				if (itemId) {
					console.log("Update item "+itemId+" field " + field + " with " + value);
					let item = this.actor.items.get(itemId);
					item.update({ [field]: value });
				} else {
					console.log("Update actor field " + field + " with " + value);
					this.actor.update({ [field]: value });
				} 
			});
			html.find('[data-check]').click(event => {
				const element = event.currentTarget;
				console.log("Came here with checked=" + element.checked + "  and value=" + element.value);
				let value = element.checked;
				const itemId = this._getClosestData($(event.currentTarget), 'item-id');
				const field = element.dataset.check;
				if (itemId) {
					console.log("Update field " + field + " with " + value);
					this.actor.items.get(itemId).update({ [field]: value });
				} else {
					console.log("Update actor field " + field + " with " + value);
					this.actor.update({ [field]: value });
				}
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
			//Collapsible
			html.find('select.contdrolled').change(event => {
				const element = event.currentTarget;
				const itemId = this._getClosestData($(event.currentTarget), 'item-id');
				console.log("SELECT ",element);
				console.log("SELECT2",event);
				console.log("SELECT3",event.target.value);
				console.log("-> itemId ",itemId);
				console.log("-> ds ",element.dataset);
				
				
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

	_onCreateNewEmbeddedItem(type, itemtype) {
		let itemData = {
			name: itemtype ? game.i18n.localize("shadowrun6.newitem."+itemtype.toLowerCase()) : game.i18n.localize("shadowrun6.newitem."+type.toLowerCase()) ,
			type: type,
			
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
	/**
	 * Handle rolling a Skill check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRollSkillCheck(event, html) {
		event.preventDefault();
		const skill     = event.currentTarget.dataset.skill;
		const skillSpec = event.currentTarget.dataset.skillspec;
		const threshold = event.currentTarget.dataset.threshold;
		const attrib    = event.currentTarget.dataset.attrib;
		let options = {};
		if (attrib)
			options.attrib = attrib;
		if (threshold) {
			this.actor.rollSkill(skill, skillSpec, threshold, options);			
		} else {
			this.actor.rollSkill(skill, skillSpec, game.shadowrun6.defaultThreshold, options);
		}
	}

	_onRollItemCheck(event, html) {
		event.preventDefault();
		const item = event.currentTarget.dataset.itemId;
		this.actor.rollItem(item, { event: event });
	}

	_onRollSpellCheck(event, html) {
		event.preventDefault();
		const item = event.currentTarget.dataset.itemId;
		this.actor.rollSpell(item, false, { event: event });
	}

	_onRollRitualCheck(event, html) {
		event.preventDefault();
		const item = event.currentTarget.dataset.itemId;
		this.actor.rollSpell(item, true, { event: event });
	}

	_onCommonCheck(event, html) {
		console.log("onCommonCheck");
		event.preventDefault();
		const pool = event.currentTarget.dataset.pool;
		let classList = event.currentTarget.classList;
		let title;
		if (classList.contains("defense-roll") ) {
			title = game.i18n.localize("shadowrun6.defense." + event.currentTarget.dataset.itemId);
		} else if (classList.contains("attributeonly-roll")) {
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

    _onHealCheck(event, html) {
        console.log("onHealCheck");
        event.preventDefault;
        const dataset = event.currentTarget.dataset;
        this.actor.rollHealCheck(dataset);
    }

	//-----------------------------------------------------
	_onMatrixAction(event, html) {
		event.preventDefault();
		console.log("onMatrixAction ",event.currentTarget.dataset);
		const matrixId = event.currentTarget.dataset.matrixId;
		const matrixAction = CONFIG.SR6.MATRIX_ACTIONS[matrixId];
		this.actor.performMatrixAction(matrixAction, matrixId, { event: event });
	}

	//-----------------------------------------------------
	_onRollComplexFormCheck(event, html) {
		event.preventDefault();
		const item = event.currentTarget.dataset.itemId;
		this.actor.rollComplexForm(item, { event: event });
	}

	//-----------------------------------------------------
	_getClosestData(jQObject, dataName, defaultValue = "") {
		let value = jQObject.closest(`[data-${dataName}]`)?.data(dataName);
		return (value) ? value : defaultValue;
	}

	//-----------------------------------------------------
	_setDamage(html, i, monitorAttribute, id, event) {
		switch (event.target.parentNode.getAttribute("id")) {
			case "barPhyBoxes":
				//Allow setting zero health by clicking again
				if (this.actor.data.data.physical.dmg == monitorAttribute.max-1 == i) {
          			console.log(`setDamange (physical health to ${monitorAttribute.max}`);
          			this.actor.update({ [`data.physical.dmg`]: monitorAttribute.max});
				} else {
         			console.log(`setDamange (physical health to ${monitorAttribute.max -i}`);
					this.actor.update({ [`data.physical.dmg`]: monitorAttribute.max - i });
				}
				break;
			case "barStunBoxes":
				//Allow setting zero health by clicking again
				if (this.actor.data.data.stun.dmg == monitorAttribute.max-1 == i) {
          			console.log(`setDamange (stun health to ${monitorAttribute.max}`);
					this.actor.update({ [`data.stun.dmg`]: monitorAttribute.max});
				} else {
          			console.log(`setDamange (stun health to ${monitorAttribute.max -i}`);
					this.actor.update({ [`data.stun.dmg`]: monitorAttribute.max - i });
				}
				break;
            case "barOverflowBoxes":
				if (this.actor.data.data.overflow.dmg == monitorAttribute.max-1 == i) {
          			console.log(`setDamange (overflow health to ${i}`);
					this.actor.update({ [`data.overflow.dmg`]: i});
				} else {
          			console.log(`setDamange (overflow health to ${i}`);
					this.actor.update({ [`data.overflow.dmg`]: i });
				}
                break;
		}
	}

	//-----------------------------------------------------
	_redrawBar(html, id, monitorAttribute) {
    	if (!monitorAttribute || monitorAttribute.value === null)
			return;
		//let vMax = parseInt(html.find("#data"+id+"Max")[0].value);
		//let vCur = parseInt(html.find("#data"+id+"Cur")[0].value);
        let perc = Math.min(Math.max(monitorAttribute.value / monitorAttribute.max * 100, 0), 100);
		if ( html.find("#bar" + id + "Cur").length==0) {
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
			let i = 0;
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

			// The scale (only for physical + stun)
			myNode = html.find("#bar" + id + "Scale")[0];
            if (myNode) {
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
	}

	_create_UUID(){
		var dt = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (dt + Math.random()*16)%16 | 0;
			dt = Math.floor(dt/16);
			return (c=='x' ? r :(r&0x3|0x8)).toString(16);
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
