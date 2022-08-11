export default class Shadowrun6Combatant extends Combatant {
	edgeGained: number = 0;

	constructor(
		data: ConstructorParameters<typeof foundry.documents.BaseCombatant>[0],
		context: ConstructorParameters<typeof foundry.documents.BaseCombatant>[1]
	) {
		super(data, context);
		console.log("Shadowrun6Combatant.<init>");
	}
}
