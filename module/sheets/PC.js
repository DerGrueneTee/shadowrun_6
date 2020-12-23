/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["shadowrun6", "sheet", "actor"],
        template: "systems/shadowrun6eden/templates/shadowrun6-actor-sheet.html",
        width: 600,
        height: 800,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
        scrollY: [".biography", ".items", ".attributes"],
        dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
      });
    }
  }