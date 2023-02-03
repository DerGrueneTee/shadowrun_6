import { InitiativeType } from "./dice/RollTypes.js";
import Shadowrun6Combatant from "./Shadowrun6Combatant.js";

export default class Shadowrun6CombatTracker extends CombatTracker {
	get template() {
		return "systems/shadowrun6-eden/templates/combat-tracker.html";
	}

	/*
	activateListeners(html: JQuery<HTMLElement>): void {
   	super.activateListeners(html);

   	console.log("SR6CombatTracker.activateListener");
   	// see https://www.youtube.com/watch?v=OlagJzZsEew&t=671s
   	//html.find(".shotcost").change(this._onShotCostChanged.bind(this));
	}
	*/

	async getData(options?: Partial<ApplicationOptions> | undefined): Promise<CombatTracker.Data> {
		let data : Promise<CombatTracker.Data> = super.getData(options);
		data.then(function (data:CombatTracker.Data) {
			if (data != undefined) {
				data.turns.forEach(function (turn:Shadowrun6Turn) {
				  let combatant : Shadowrun6Combatant | undefined = (data.combat?.combatants.get(turn.id) as Shadowrun6Combatant);
				  turn.isPhysical = combatant!.iniType==InitiativeType.PHYSICAL;
				  turn.isMatrix   = combatant!.iniType==InitiativeType.MATRIX;
				  turn.isAstral   = combatant!.iniType==InitiativeType.ASTRAL;
				});
			}
			return data;
		});
   	return data;
   }

	/**
	 * Test if any of the extra initiatve buttons from the extended tracker
	 * has been clicked. If not, process with default behaviour.
	 */
   protected _onCombatantControl(event: JQuery.ClickEvent): Promise<void> {
		console.log("---------SR6CombatTracker._onCombatantControl", event);
		const btn = event.currentTarget;
		const li = btn.closest(".combatant");
		const combat = this.viewed;
      const c : Shadowrun6Combatant = (combat!.combatants.get(li.dataset.combatantId) as Shadowrun6Combatant)!;

		// Switch control action
    	switch (btn.dataset.control) {
     	case "togglePhysical":
	 		return this._onChangeInitiativeType(c, InitiativeType.PHYSICAL);
     	case "toggleMatrix":
	  		return this._onChangeInitiativeType(c, InitiativeType.MATRIX);
      case "toggleAstral":
	 		return this._onChangeInitiativeType(c, InitiativeType.ASTRAL);
      }

	   return super._onCombatantControl(event);
	}

	async _onChangeInitiativeType(combatant : Shadowrun6Combatant , value : InitiativeType) {
		  combatant.iniType = value;
        await combatant.update({iniType: value});
        // Refresh combat tracker
        combatant.combat?.update();
	}


}

type Shadowrun6Turn = CombatTracker.Turn & {
      isPhysical: boolean;
      isAstral  : boolean;
      isMatrix  : boolean;
};
