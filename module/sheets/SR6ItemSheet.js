export class SR6ItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["shadowrun6", "sheet", "item"],
        template: "systems/shadowrun6-eden/templates/shadowrun6-item-sheet.html",
        width: 400,
        height: 500,
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
        }
    }
  }