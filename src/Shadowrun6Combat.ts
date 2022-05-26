export default class Shadowrun6Combat extends Combat {

  /**
   * Define how the array of Combatants is sorted in the displayed list of the tracker.
   * This method can be overridden by a system or module which needs to display combatants in an alternative order.
   * By default sort by initiative, next falling back to name, lastly tie-breaking by combatant id.
   * @private
   */
  _sortCombatants(a: Combatant, b: Combatant): number {
    let ia = Number.isNumeric(a.initiative) ? a.initiative : -9999;
    let ib = Number.isNumeric(b.initiative) ? b.initiative : -9999;
    if (!ia) ia=0;
    if (!ib) ib=0;
    let ci: Number = ib - ia;
    if (ci !== 0) return Number(ci);
    let cn = a.name.localeCompare(b.name);
    if (cn !== 0) return cn;
    return 0;
  }
}