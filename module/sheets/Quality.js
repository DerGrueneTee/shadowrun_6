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
  
  }