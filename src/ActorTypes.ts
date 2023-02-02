import { MagicOrResonanceDefinition } from "./DefinitionTypes.js";
import { ComplexForm, Gear, MatrixDevice, Persona, Spell, Weapon } from "./ItemTypes.js";

export class Attribute {
	base: number;
	mod: number;
	modString: string = "";
	augment: number;
	pool: number;
}

export class Attributes {
	bod: Attribute = new Attribute();
	agi: Attribute = new Attribute();
	rea: Attribute = new Attribute();
	str: Attribute = new Attribute();
	wil: Attribute = new Attribute();
	log: Attribute = new Attribute();
	int: Attribute = new Attribute();
	cha: Attribute = new Attribute();
	mag: Attribute = new Attribute();
	res: Attribute = new Attribute();
}

export class Skill {
	points: number;
	specialization: string | undefined;
	expertise: string | undefined;
	modifier: number;
	augment: number;
	poolS: number;
	poolE: number;
	pool: number;
}

export class Skills {
	astral: Skill = new Skill();
	athletics: Skill = new Skill();
	biotech: Skill = new Skill();
	close_combat: Skill = new Skill();
	con: Skill = new Skill();
	conjuring: Skill = new Skill();
	cracking: Skill = new Skill();
	electronics: Skill = new Skill();
	enchanting: Skill = new Skill();
	engineering: Skill = new Skill();
	exotic_weapons: Skill = new Skill();
	firearms: Skill = new Skill();
	influence: Skill = new Skill();
	outdoors: Skill = new Skill();
	perception: Skill = new Skill();
	piloting: Skill = new Skill();
	sorcery: Skill = new Skill();
	stealth: Skill = new Skill();
	tasking: Skill = new Skill();
}

export class Monitor {
	mod: number;
	modString: string;
	value: number = 9;
	dmg: number;
	max: number;
}

export class Derived {
	composure: Attribute = new Attribute();
	judge_intentions: Attribute = new Attribute();
	memory: Attribute = new Attribute();
	lift_carry: Attribute = new Attribute();
	matrix_perception: Attribute = new Attribute();
	resist_damage: Attribute = new Attribute();
	resist_toxin: Attribute = new Attribute();
}

export class Initiative {
	base: number;
	mod: number;
	pool: number;
	dice: number;
	diceMod: number;
	dicePool: number;
}

export class Ratings {
	astral: Attribute = new Attribute();
	matrix: Attribute = new Attribute();
	physical: Attribute = new Attribute();
	resonance: Attribute = new Attribute();
	social: Attribute = new Attribute();
	vehicle: Attribute = new Attribute();
}

export class Pool {
	base: number;
	pool: number | undefined = 0;
	mod: number = 0;
	modString: string | undefined;
}

export class DefensePool {
	physical: Pool = new Pool();
	astral: Pool = new Pool();
	spells_direct: Pool = new Pool();
	spells_indirect: Pool = new Pool();
	spells_other: Pool = new Pool();
	vehicle: Pool = new Pool();
	toxin: Pool = new Pool();
	damage_physical: Pool = new Pool();
	damage_astral: Pool = new Pool();
	drain: Pool = new Pool();
	fading: Pool = new Pool();
}

class Tradition {
	genesisID: string;
	name: string;
	attribute: string = "log";
}

export class SR6Actor {
	attackrating: Ratings = new Ratings();
	defenserating: Ratings = new Ratings();
}

export class Lifeform extends SR6Actor {
	attributes: Attributes = new Attributes();
	derived: Derived = new Derived();
	initiative: {
		actions: number;
		physical: Initiative;
		astral: Initiative;
		matrixar: Initiative;
		matrixcold: Initiative;
		matrixhot: Initiative;
	};
	physical: Monitor = new Monitor();
	stun: Monitor = new Monitor();
	overflow: Monitor = new Monitor();
	edge: Monitor = new Monitor();
	defensepool: DefensePool = new DefensePool();
	tradition: Tradition = new Tradition();
	skills: Skills = new Skills();
	essence: number = 6.0;
	mortype: string;
	morDef: MagicOrResonanceDefinition;
	controlRig: number = 0;
}
export interface ILifeform {
	attributes: Attributes;
	skills: Skills;
}
export class Spirit extends Lifeform {
	rating : number;
	spiritType : string;
}

export class MatrixUser extends Lifeform {
	persona: Persona = new Persona();
}

export class Player extends MatrixUser {}

export enum VehicleOpMode {
	MANUAL = "manual",
	RIGGED_AR = "riggedAR",
	RIGGED_VR = "riggedVR",
	RCC = "rcc",
	AUTONOMOUS = "autonomous"
}

export class CurrentVehicle {
	belongs: string;
	opMode: VehicleOpMode = VehicleOpMode.MANUAL;
	offRoad: false;
	speed: number;
	handling: Pool;
	ar: Pool;
	dr: Pool;
	modifier: number;
	kmh: number;
}

export class VehicleSkill {
	points: number;
	modifier: number;
	pool: number;
}

export class VehicleSkills {
	piloting: VehicleSkill;
	evasion: VehicleSkill;
	stealth: VehicleSkill;
}

export class VehicleActor {
	physical: Monitor = new Monitor();
	stun: Monitor = new Monitor();
	edge: Monitor = new Monitor();
	skills: VehicleSkills = new VehicleSkills();
	handleOn: number;
	handleOff: number;
	accOn: number;
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
	notes: string;
}
