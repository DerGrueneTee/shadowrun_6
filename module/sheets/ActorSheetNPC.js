/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorNPCSheet extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["shadowrun6", "sheet", "actor"],
			template: "systems/shadowrun6-eden/templates/shadowrun6-actor-npc-sheet.html",
			width: 700,
			height: 800,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "overview" }],
			scrollY: [".items", ".attributes"],
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
			html.find('.skill-roll').click(this._onRollSkillCheck.bind(this));
			html.find('.quality-create').click(ev => {
				const itemData = {
					name: game.i18n.localize("shadowrun6.qualityedit.new"),
					type: "quality",
				};
				return this.actor.createEmbeddedDocuments("Item", [itemData]);
			});
			html.find('.item-edit').click(ev => {
				const element = ev.currentTarget.closest(".item");
				const item = this.actor.getOwnedItem(element.dataset.itemId);
				item.sheet.render(true);
			});
			html.find('.item-delete').click(this._onItemDelete.bind(this));
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

	_onItemDelete(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		this.actor.deleteOwnedItem(li.dataset.itemId);
	  }


}