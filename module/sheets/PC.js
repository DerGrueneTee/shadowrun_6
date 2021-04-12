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
		    html.find(".calcPHYBar").on("input",this._onRecalculatePhysicalBar(html));
		    html.find(".bodChanged").on("input",this._onBodyChanged(html));
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
	_onBodyChanged(html){
		let actorData = this.object.data.data;
	    console.log("_onBodyChanged  "+actorData.attributes["bod"].pool);
	  }

	  //-----------------------------------------------------
	  _onRecalculatePhysicalBar(html){
	    console.log("LE editiert  "+html);
	    let vMax = parseInt(html.find("#dataPhyMax")[0].value);
	    console.log("vMax = "+vMax);
	    let vCur = parseInt(html.find("#dataPhyCur")[0].value);
	    console.log("vCur = "+vCur);
	    let totalVer = vMax-vCur;  // Wieviel nach Verschnaufpause
	    console.log("Damage = "+totalVer);
	    let percVerz = totalVer/vMax *100;
	    console.log("Percent = "+percVerz);
	    html.find("#barPhyCur")[0].style.width = percVerz+"%";
//	    this.object.data.data.le.cur = totalCur;
	  }


}