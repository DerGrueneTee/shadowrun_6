import { CurrentVehicle, Initiative, Monitor, Pool } from "./ActorTypes.js";

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

export class GenesisData {
	genesisID: string = "";
	description: string = "";
}

export class AdeptPower extends GenesisData {
	hasLevel: boolean = false;
	activation: Activation = Activation.MAJOR_ACTION;
	cost: number = 0.0;
	// For AdeptPowerValue
	choice: string = "";
	level: number = 0;
}

export class ComplexForm extends GenesisData {
	duration: Duration = Duration.sustained;
	fading: number = 3;
	skill: string | null = "";
	attrib: string = "res";
	threshold: number = 0;
	oppAttr1: string | null = "";
	oppAttr2: string | null = "";
	constructor(skill: string | null, attr1: string | null, attr2: string | null, threshold: number = 0) {
		super();
		this.skill = skill;
		this.oppAttr1 = attr1;
		this.oppAttr2 = attr2;
		this.threshold = threshold;
	}
}

export class CritterPower extends GenesisData {
	duration: Duration = Duration.instantaneous;
	action: Activation = Activation.MINOR_ACTION;
	range: EffectRange = EffectRange.self;
}

export class Gear extends GenesisData {
	type: string = "";
	subtype: string = "";
	/** Identifier of skill associated with this item */
	skill: string = "";
	/** Identifier of a skill specialization */
	skillSpec: string = "";
	/** Dicepool modifier only used when using this item */
	modifier: number = 0;
	/** Shall the wild die be used? */
	wild: boolean = false;
	/** Amount of dice to use. Calculated when preparing actor */
	pool: number = 0;
}
export class Vehicle extends Gear {
	handlOn: number;
	handlOff: number;
	accO: number;
	accOff: number;
	spdiOn: number;
	spdiOff: number;
	tspd: number;
	bod: number;
	arm: number;
	pil: number;
	sen: number;
	sea: number;
	vtype: string;
	vehicle: CurrentVehicle = new CurrentVehicle();
}

export class Spell extends Gear {
	category: string = "health";
	duration: string = "instantaneous";
	drain: number = 1;
	type: string = "physical";
	range: string = "self";
	damage: string = "";
	alchemic: boolean;
	multiSense: boolean = false;
	isOpposed: boolean;
	withEssence: boolean;
	wildDie: boolean;
	threshold: number = 0;
	isSustained: boolean = false;
}

export class Weapon extends Gear {
	/** Base weapon damage */
	dmg: number;
	/** Is stun damage */
	stun: boolean = false;
	/** Damage representation string */
	dmgDef: string = "";
	/** Attack rating for 5 ranges */
	attackRating: Array<number> = [0, 0, 0, 0, 0];
	modes: {
		BF: false;
		FA: false;
		SA: false;
		SS: false;
	};
	strWeapon : boolean;
}
export class Armor extends Gear {
	defense: number;
	usedForPool: boolean;
}

export class MatrixDevice extends Gear {
	a: number;
	s: number;
	d: number;
	f: number;
	devRating: number;
	usedForPool: boolean;
}

export class DevicePersona {
	/** Built from devices Commlink/Cyberjack + Cyberdeck */
	base: MatrixDevice = new MatrixDevice();
	/** Final distribution */
	mod: MatrixDevice = new MatrixDevice();
}
export class LivingPersona {
	/** Defined from attributes */
	base: MatrixDevice = new MatrixDevice();
	/** Resonance distribution */
	mod: MatrixDevice = new MatrixDevice();
}

export class Persona extends Gear {
	/** */
	device: DevicePersona = new DevicePersona();
	/** Calculated living persona */
	living: LivingPersona = new LivingPersona();
	/** The decision which (virtual) Matrix persona to use */
	used: MatrixDevice = new MatrixDevice();
	/** Living persona -  */
	monitor: Monitor = new Monitor();
	initiative: Initiative = new Initiative();
}
