export class SR6ItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["shadowrun6", "sheet", "item", "gear"],
      template: "systems/shadowrun6-eden/templates/shadrowun6-item-sheet.html",
      width: 500,
      height: 600,
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
    if ((this.actor && this.actor.isOwner)) {
      html.find('[data-field]').change(event => {
        const element = event.currentTarget;
        let value;
        if (element.type == "checkbox") {
          value = element.checked;
        } else {
          value = element.value;
        }
        const itemId = this.object.data.id;
        const field = element.dataset.field;
        this.actor.items.get(itemId).update({ [field]: value });
      });
    } else if (this.isEditable) {
      html.find('[data-field]').change(event => {
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
      html.find('[data-array-field]').change(event => {
        const element = event.currentTarget
        const idx = parseInt($(event.currentTarget).closestData('index', "0"));
        const array = $(event.currentTarget).closestData('array');
        const field = $(event.currentTarget).closestData('array-field');
        let newValue = [];
        if (!(idx >= 0 && array !== "")) return;
        if (field) {
          newValue = duplicate(array.split('.').reduce(function (prev, curr) {
            return prev ? prev[curr] : null
          }, this.object.data));
          newValue[idx][field] = element.value;
        } else {
          newValue = duplicate(array.split('.').reduce(function (prev, curr) {
            return prev ? prev[curr] : null
          }, this.object.data));
          newValue[idx] = element.value;
        }
        this.object.update({ [array]: newValue });
      });
    }

  }


}