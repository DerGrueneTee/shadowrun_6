export class QualityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["shadowrun6", "sheet", "item", "quality"],
      template: "systems/shadowrun6-eden/templates/shadowrun6-quality-sheet.html",
      width: 400,
      height: 500,
    });
  }

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
    if ((this.actor && this.actor.isOwner)) {
      html.find('[data-field]').change(event => {
        const element = event.currentTarget;
        let value = element.value;
        const itemId = this.object.data._id;
        const field = element.dataset.field;
        this.actor.items.get(itemId).update({ [field]: value });
      });

    } else if (this.isEditable) {
      html.find('[data-field]').change(event => {
        const element = event.currentTarget;
        let value = element.value;
        const field = element.dataset.field;
        this.object.update({ [field]: value });
      });
    }

  }
}