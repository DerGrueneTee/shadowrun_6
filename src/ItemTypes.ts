
/**
 * Items
 */
enum Duration {
	instantaneous,
   sustained
}
enum Activation {
    MINOR_ACTION,
    MAJOR_ACTION,
    PASSIVE
}

enum EffectRange {
	self,
	los
}

class GenesisData {
    genesisID: string = "";
    description: string = "";
}

class AdeptPower extends GenesisData {
    hasLevel: boolean = false;
    activation: Activation = Activation.MAJOR_ACTION;
    cost: number = 0.0;
    // For AdeptPowerValue
    choice: string = "";
    level: number = 0;
}

class ComplexForm extends GenesisData {
	duration: Duration = Duration.sustained;
	fading: number = 3;
	skill: string = "";
	attrib: string = "res";
	threshold: number = 0;
	oppAttr1 : string = "";
	oppAttr2 : string = "";
}

class CritterPower extends GenesisData {
	duration: Duration = Duration.instantaneous;
	action: Activation = Activation.MINOR_ACTION;
	range: EffectRange = EffectRange.self;
}

class Gear extends GenesisData {
	/** Identifier of skill associated with this item */
	skill : string = "";
	/** Identifier of a skill specialization */
	skillSpec : string = "";
	/** Dicepool modifier only used when using this item */
	modifier : number = 0;
	/** Shall the wild die be used? */
	wild : boolean = false;
	/** Amount of dice to use. Calculated when preparing actor */
	pool : number = 0;
}
