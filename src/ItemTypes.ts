
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
	skill: string|null = "";
	attrib: string = "res";
	threshold: number = 0;
	oppAttr1 : string | null = "";
	oppAttr2 : string | null = "";
	constructor(skill:string|null, attr1:string|null, attr2:string|null, threshold:number=0) {
		super();
		this.skill   = skill;
		this.oppAttr1 = attr1;
		this.oppAttr2 = attr2;
		this.threshold = threshold;
	}
}

class CritterPower extends GenesisData {
	duration: Duration = Duration.instantaneous;
	action: Activation = Activation.MINOR_ACTION;
	range: EffectRange = EffectRange.self;
}

class Gear extends GenesisData {
	type : string = "";
	subtype : string = "";
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

class Spell extends Gear {
	category : string = "health";
	duration : string = "instantaneous";
	drain    : number = 1;
	type     : string = "physical";
	range    : string = "self";
	damage   : string = "";
	alchemic : boolean;
	multiSense : boolean = false;
	isOpposed  : boolean;
	withEssence: boolean;
	wildDie    : boolean;
	threshold  : number = 0;
}

class Weapon extends Gear {
	/** Base weapon damage */
	dmg : number;
	/** Is stun damage */
	stun : boolean = false;
	/** Damage representation string */
	dmgDef : string = "";
	/** Attack rating for 5 ranges */
	attackRating:Array<number> = [0,0,0,0,0];
	modes :  {
				"BF": false,
				"FA": false,
				"SA": false,
				"SS": false
			};
}

class MatrixDevice extends Gear {
	a:number;
	s:number;
	d:number;
	f:number;
	devRating:number;
	usedForPool: boolean;
}

class Persona extends Gear {
	base: MatrixDevice = new MatrixDevice;
	used: MatrixDevice = new MatrixDevice;
}
