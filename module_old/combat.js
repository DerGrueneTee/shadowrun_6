export default class Shadowrun6Combat extends Combat {
	
  /**
   * Define how the array of Combatants is sorted in the displayed list of the tracker.
   * This method can be overridden by a system or module which needs to display combatants in an alternative order.
   * By default sort by initiative, next falling back to name, lastly tie-breaking by combatant id.
   * @private
   */
  _sortCombatants(a, b) {
    const ia = Number.isNumeric(a.initiative) ? a.initiative : -9999;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : -9999;
    let ci = ib - ia;
    if ( ci !== 0 ) return ci;
    let cn = a.name.localeCompare(b.name);
    if ( cn !== 0 ) return cn;
    return -(a.id - b.id);
  }

	/*
    async startCombat() {
        await this.setupTurns();
        await this.setFlag("splittermond", "tickHistory", []);

        this.current.round = this.combatants[0].initiative;

        return super.nextRound();
    }

    async nextTurn(nTicks = 0) {
        if (nTicks == 0) {
            let p = new Promise((resolve, reject) => {
                let dialog = new Dialog({
                    title: "Ticks",
                    content: "<input type='text' class='ticks' value='3'>",
                    buttons: {
                        ok: {
                            label: "Ok",
                            callback: html => {
                                resolve(parseInt(html.find('.ticks')[0].value));
                            }
                        }
                    }
                });
                dialog.render(true);
            });
            nTicks = await p;
        }



        let combatant = this.combatant;

        let newInitiative = Math.round(combatant.initiative) + nTicks;


        //await this.updateCombatant({ _id: combatant._id, "flags.relativeTickPosition": combatant.flags.relativeTickPosition })

        return this.setInitiative(combatant._id, newInitiative);
    }

    async setInitiative(id, value, first = false) {
        value = Math.round(value);
        if (value < 10000) {
            if (!first) {
                value = this.combatants.reduce((acc, c) => {
                    return ((Math.round(c.initiative) == value) ? Math.max((c.initiative || 0) + 0.01, acc) : acc);
                }, value);
            } else {
                value = this.combatants.reduce((acc, c) => {
                    return ((Math.round(c.initiative) == value) ? Math.min((c.initiative || 0) - 0.01, acc) : acc);
                }, value);
            }
        } else {
            if (value !== 10000 && value !== 20000) {
                return
            }
        }


        await this.updateCombatant({
            _id: id,
            initiative: value
        });
        await this.nextRound();
    }

    get turn() {
        return 0;
    }

    get round() {
        return this.data.round;
    }

    get started() {
        return (this.turns.length > 0);
    }

    async startCombat() {
        return this.nextRound();
    }

    async nextRound() {
        //await super.nextRound();
        return this.update({ round: Math.round(this.combatants.reduce((acc, c) => Math.min(c.initiative, acc), 99999)), turn: 0 });
    }

    async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
        //if (updateTurn) {
        //    return super.rollInitiative(ids, { formula: formula, updateTurn: updateTurn, messageOptions: messageOptions });
        //} else {
        await super.rollInitiative(ids, { formula: formula, updateTurn: updateTurn, messageOptions: messageOptions });
        return this.nextRound();
        //}


    }
*/
}