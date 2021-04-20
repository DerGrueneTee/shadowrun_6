/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorSheet extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["shadowrun6", "sheet", "actor"],
			template: "systems/shadowrun6-eden/templates/shadowrun6-actor-sheet.html",
			width: 800,
			height: 900,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "basics" }],
			scrollY: [".biography", ".items", ".attributes"],
			dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
		});
	}


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
			html.find('.skill-name').click(this._onRollSkillCheck.bind(this));
			html.find(".calcPHYBar").on("input", this._redrawBar(html, "Phy"));
			html.find(".calcStunBar").on("input", this._redrawBar(html, "Stun"));
			html.find(".bodChanged").on("input", this._onBodyChanged(html));
		} else {
			html.find(".rollable").each((i, el) => el.classList.remove("rollable"));
		}

		// Handle default listeners last so system listeners are triggered first
		super.activateListeners(html);
	}

	/**
	 * Handle rolling a Skill check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRollSkillCheck(event, html) {
		event.preventDefault();
		const skill = event.currentTarget.dataset.skill;
		this.actor.rollSkill(skill, { event: event });
	}

	//-----------------------------------------------------
	_onBodyChanged(html) {
		let actorData = this.object.data.data;
		console.log("_onBodyChanged  " + actorData.attributes["bod"].pool);
	}

	//-----------------------------------------------------
	_redrawBar(html, id) {
		let vMax = parseInt(html.find("#data"+id+"Max")[0].value);
		let vCur = parseInt(html.find("#data"+id+"Cur")[0].value);
		let totalVer = vMax - vCur;  // Wieviel nach Verschnaufpause
		let percVerz = totalVer / vMax * 100;
		html.find("#bar"+id+"Cur")[0].style.width = percVerz + "%";

		let myNode = html.find("#bar"+id+"Boxes")[0];
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
			myNode = html.find("#bar"+id+"Scale")[0];
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