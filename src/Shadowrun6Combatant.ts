import { InitiativeType } from "./dice/RollTypes.js";

export default class Shadowrun6Combatant extends Combatant {
	edgeGained: number = 0;

	constructor(
		data: ConstructorParameters<typeof foundry.documents.BaseCombatant>[0],
		context: ConstructorParameters<typeof foundry.documents.BaseCombatant>[1]
	) {
		super(data, context);
		console.log("Shadowrun6Combatant.<init>");
		this.setFlag("shadowrun6-eden","iniType", InitiativeType.PHYSICAL);
	}

    get initiativeType(): InitiativeType {
		return this.getFlag("shadowrun6-eden", "iniType") as InitiativeType;
	}


	protected _getInitiativeFormula(): string {
	   console.log("Shadowrun6Combatant._getInitiativeFormula: ", this.initiativeType);

	   switch (this.initiativeType) {
		case InitiativeType.PHYSICAL : return "@initiative.physical.pool + (@initiative.physical.dicePool)d6";
		case InitiativeType.ASTRAL   : return "@initiative.astral.pool + (@initiative.astral.dicePool)d6";
		case InitiativeType.MATRIX   : return "@initiative.matrix.pool + (@initiative.matrix.dicePool)d6";
		default:
	   	return super._getInitiativeFormula();
	   }
   }

	 rollInitiative(formula: string): Promise<this | undefined> {
	   console.log("Shadowrun6Combatant.rollInitiative: ",formula);

	   return super.rollInitiative(formula);
	 }

	  getInitiativeRoll(formula?: string): Roll {
	   console.log("Shadowrun6Combatant.getInitiativeRoll: ",formula);
	   return super.getInitiativeRoll(formula);
	  }

}
