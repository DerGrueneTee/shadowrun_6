import { ChatMessageData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import { Lifeform, Monitor, Skill, VehicleActor, VehicleSkill } from "../ActorTypes.js";
import { Defense, MonitorType } from "../config.js";
import { EdgeBoost, MatrixAction, SkillDefinition } from "../DefinitionTypes.js";
import { ComplexForm, Gear, Spell, Weapon } from "../ItemTypes.js";
import { Shadowrun6Actor } from "../Shadowrun6Actor.js";

export enum RollType {
	Common = "common",
	Weapon = "weapon",
	Skill = "skill",
	Spell = "spell",
	Ritual = "ritual",
	Vehicle = "vehicle",
	ComplexForm = "complexform",
	MatrixAction = "matrix",
	/** Defense is a way to reduce netto hits */
	Defense = "defense",
	/** Reduce netto damage */
	Soak = "soak",
	/** Directly apply the given damage */
	Damage = "damage",
	Initiative = "initiative"
}

export enum SoakType {
	DAMAGE_STUN = "damage_stun",
	DAMAGE_PHYSICAL = "damage_phys",
	DRAIN = "drain",
	FADING = "fading"
}
export enum InitiativeType {
  PHYSICAL = "physical",
  ASTRAL   = "astral",
  MATRIX   = "matrix"
}

export enum ReallyRoll {
	ROLL,
	AUTOHITS
}

export class TokenData {
	id : string;
	actorId : string |null;
	sceneId : string | null;
	name : string;
	constructor(token : Token) {
		this.id = token.id;
		this.name = token.name;
		this.sceneId = token.scene.id;
		if (token.actor)
			this.actorId = token.actor.id;
	}
}

class CommonRollData {
	speaker: ChatSpeakerDataProperties;
	actor: Shadowrun6Actor;

	/* Suggested Window title */
	title: string;
	/**
	 * Text to describe what is happening.
	 * e.g. <i>X is shooting at Y</i>
	 */
	actionText: string;
	/** Describe what is being rolled */
	checkText: string;

	rollType: RollType;

	/* Opposed rolls: How to oppose? */
	defendWith: Defense;
	get isOpposed(): boolean {
		return this.defendWith != undefined;
	}

	threshold: number;
	/* Use a wild die */
	useWildDie: number = 0;
	rollMode: "publicroll" | "gmroll" | "blindroll" | "selfroll" | undefined;

	/* How many dice shall be rolled */
	pool: number;

	copyFrom(copy: CommonRollData) {
		this.speaker = copy.speaker;
		this.actor = copy.actor;
		this.title = copy.title;
		this.actionText = copy.actionText;
		this.checkText = copy.checkText;
		this.rollType = copy.rollType;
		this.defendWith = copy.defendWith;
		this.threshold = copy.threshold;
		this.useWildDie = copy.useWildDie;
		this.pool = copy.pool;
	}
}

/************************************
 * Returned after
 ************************************/
export interface OpposedRoll {
	defendWith: Defense;
	attackRating: number;
	defenseRating: number;
}

enum PoolUsage {
	OneForOne,
	OneForAll
}

export interface AttackRollData {
	defendWith: Defense;

	/** Which tokens are selected */
	targets?: TokenData[] | null;

	attackRating?: number;
	weaponAttackRating?: number[];

	poolUsage: PoolUsage;
	/** when poolUsage is OneOnOne: How large is your pool per TokenData*/
	perTargetPool: Map<TokenData, number>;
}

export interface WeaponRollData extends AttackRollData {
	weapon: Weapon;
}

export interface SpellRollData extends AttackRollData {
	spell: Spell;
}

/**
 * The data fro a roll known before presenting a roll dialog
 */
export class PreparedRoll extends CommonRollData {
	allowBuyHits: boolean;
	/* Does this check generate a free edge */
	freeEdge: boolean;
	/* Available edge */
	edge: number;
	edgeBoosts: EdgeBoost[];
	/** Effective dice pool applying firing mode or other modifiers */
	calcPool: number;
	performer: Lifeform;

	copyFrom(copy: PreparedRoll) {
		super.copyFrom(copy);
		this.allowBuyHits = copy.allowBuyHits;
		this.freeEdge = copy.freeEdge;
		this.edge = copy.edge;
		this.edgeBoosts = copy.edgeBoosts;
		this.performer = copy.performer;
	}
}

export class DefenseRoll extends PreparedRoll {
	damage: number;

	constructor(threshold: number) {
		super();
		this.rollType = RollType.Defense;
		this.threshold = threshold;
	}
}

export class SoakRoll extends PreparedRoll {
	monitor: MonitorType;
	// Eventually add effects

	constructor(threshold: number) {
		super();
		this.rollType = RollType.Soak;
		this.threshold = threshold;
	}
}

export class SkillRoll extends PreparedRoll {
	rollType = RollType.Skill;

	skillId: string;
	skillDef: SkillDefinition;
	skillValue: Skill;
	skillSpec: string;
	attrib: string | undefined;

	/**
	 * @param skillVal {Skill}   The actors instance of that skill
	 */
	constructor(actor: Lifeform, skillId: string) {
		super();
		this.skillId = skillId;
		this.skillDef = CONFIG.SR6.ATTRIB_BY_SKILL.get(skillId)!;
		this.skillValue = actor.skills[skillId];
		this.attrib = this.skillDef.attrib;
		this.performer = actor;
	}

	copyFrom(copy: SkillRoll) {
		super.copyFrom(copy);
		this.skillId = copy.skillId;
		this.skillDef = copy.skillDef;
		this.skillValue = copy.skillValue;
		this.attrib = copy.attrib;
	}

	/**
	 * Execute
	 */
	prepare(actor: Shadowrun6Actor): void {}
}

export class SpellRoll extends SkillRoll {
	rollType = RollType.Spell;

	item: Item;
	itemId: string;
	spellId: string;
	spellName: string | null;
	spellDesc: string | null;
	spellSrc: string | null;
	spell: Spell;
	/** Radius of spells with area effect - may be increased */
	calcArea: number = 2;
	calcDrain: number;
	/** Damage of combat spells - may be amped up */
	calcDamage: number = 0;
	canAmpUpSpell: boolean;
	canIncreaseArea: boolean;
	defenseRating: number;
	attackRating: number;

	/**
	 * @param skill {Skill}   The skill to roll upon
	 */
	constructor(actor: Lifeform, item: Item, itemId: string, spellItem: Spell) {
		super(actor, "sorcery");
		this.item = item;
		this.itemId = itemId;
		this.spell = spellItem;
		this.skillSpec = "spellcasting";

		this.canAmpUpSpell = spellItem.category === "combat";
		this.canIncreaseArea = spellItem.range === "line_of_sight_area" || spellItem.range === "self_area";
		if (spellItem.category === "combat") {
			if (spellItem.type == "mana") {
				this.defendWith = Defense.SPELL_DIRECT;
				//this.hasDamageResist = false;
			} else {
				this.defendWith = Defense.SPELL_INDIRECT;
			}
		} else if (spellItem.category === "manipulation") {
			this.defendWith = Defense.SPELL_OTHER;
		} else if (spellItem.category === "heal") {
			if (spellItem.withEssence) {
				this.threshold = 5 - Math.ceil(actor.essence);
			}
		}

		this.calcArea = 2;
		this.calcDrain = spellItem.drain;
	}
}

export class ComplexFormRoll extends SkillRoll {
	rollType = RollType.ComplexForm;

	item: Item;
	itemId: string;
	formId: string;
	formName: string | null;
	formDesc: string | null;
	formSrc: string | null;
	form: ComplexForm;
	calcFade: number;
	defenseRating: number;
	attackRating: number;

	/**
	 * @param skill {Skill}   The skill to roll upon
	 */
	constructor(actor: Lifeform, item: Item, itemId: string, formItem: ComplexForm) {
		super(actor, "electronics");
		this.item = item;
		this.itemId = itemId;
		this.form = formItem;
		this.skillSpec = "complex_forms";
		this.attrib = "res";

		this.calcFade = formItem.fading;
	}
}

function isWeapon(obj: any): obj is Weapon {
	return obj.attackRating != undefined;
}
function getSystemData(obj: any): any {
	if ( (game as any).release.generation >= 10) return obj.system;
	return obj.data.data;
}

export class WeaponRoll extends SkillRoll implements OpposedRoll {
	rollType = RollType.Weapon;

	item: Item;
	itemId: string;
	itemName: string | null;
	itemDesc: string | null;
	itemSrc: string | null;
	gear: Gear;
	weapon: Weapon;
	targets: TokenData[];

	defenseRating: number;
	attackRating: number;
	/** Effective attack rating after applying firing mode */
	calcAttackRating: Array<number> = [0, 0, 0, 0, 0];
	/** Effective damage */
	calcDmg: number;
	/** How many units of ammunition are required */
	calcRounds: number;
	fireMode: string;
	burstMode: string | undefined;
	faArea: string | undefined;

	constructor(actor: Lifeform, item: Item, itemId: string, gear: Gear) {
		super(actor, getSystemData(item).skill);
		this.item = item;
		this.itemId = itemId;
		this.gear = gear;
		this.skillSpec = this.gear.skillSpec;
		if (isWeapon(gear)) {
			this.weapon = gear;
			this.rollType = RollType.Weapon;
			this.defendWith = Defense.PHYSICAL;
		}
		this.pool = gear.pool;
	}
}

export class MatrixActionRoll extends SkillRoll {
	rollType = RollType.MatrixAction;
	itemName: string | null;
	itemDesc: string | null;
	itemSrc: string | null;
	action: MatrixAction;
	targets: TokenData[];
	defenseRating: number;
	attackRating: number;

	constructor(actor: Lifeform, action: MatrixAction) {
		super(actor, action.skill);
		this.action = action;
		this.skillSpec = this.action.spec;
	}
}

export class VehicleRoll extends PreparedRoll {
	rollType = RollType.Vehicle;

	skillId: string;
	skillDef: SkillDefinition;
	skillValue: VehicleSkill;

	/**
	 * @param skillVal {Skill}   The actors instance of that skill
	 */
	constructor(actor: VehicleActor, skillId: string) {
		super();
		this.skillId = skillId;
		this.skillDef = CONFIG.SR6.ATTRIB_BY_SKILL.get(skillId)!;
		this.skillValue = actor.skills[skillId];
	}
}

export class ConfiguredWeaponRollData {
	defenseRating: number;
	attackRating: number;
	/** Effective attack rating after applying firing mode */
	calcAttackRating: Array<number> = [0, 0, 0, 0, 0];
	/** Effective damage */
	calcDmg: number;
	/** How many units of ammunition are required */
	calcRounds: number;
	fireMode: string;
	burstMode: string | undefined;
	faArea: string | undefined;
}

export class ConfiguredRoll extends CommonRollData {
	/** How was the dialog closed */
	buttonType: ReallyRoll;

	edgeBoost: string;
	explode: boolean;
	defRating: number;
	edgePlayer: number;
	edgeTarget: number;
	edge_message: string;
	edgeAdjusted: number;
	edge_use: string;
	/** Edge action selected  */
	edgeAction: string;
	/** Target tokens */
	targetIds: TokenData[];

	/* This methods is a horrible crime - there must be a better solution */
	updateSpecifics(copy: PreparedRoll) {
		this.targetIds = (copy as WeaponRoll).targets;
		// In case this was a WeaponRoll
		console.log("Copy WeaponRoll data to ConfiguredRoll");
		(this as any).calcAttackRating = (copy as WeaponRoll).calcAttackRating;
		(this as any).calcDmg = (copy as WeaponRoll).calcDmg;
		(this as any).calcRounds = (copy as WeaponRoll).calcRounds;
		(this as any).fireMode = (copy as WeaponRoll).fireMode;
		(this as any).burstMode = (copy as WeaponRoll).burstMode;
		(this as any).faArea = (copy as WeaponRoll).faArea;

		console.log("Copy SpellRoll data to ConfiguredRoll");
		(this as any).spell = (copy as SpellRoll).spell;
		(this as any).calcArea = (copy as SpellRoll).calcArea;
		(this as any).calcDrain = (copy as SpellRoll).calcDrain;
		(this as any).calcDamage = (copy as SpellRoll).calcDamage;
		(this as any).canAmpUpSpell = (copy as SpellRoll).canAmpUpSpell;
		(this as any).canIncreaseArea = (copy as SpellRoll).canIncreaseArea;
		(this as any).defenseRating = (copy as SpellRoll).defenseRating;
		(this as any).attackRating = (copy as SpellRoll).attackRating;
		(this as any).spellDesc = (copy as SpellRoll).spellDesc;
		(this as any).spellId = (copy as SpellRoll).spellId;
		(this as any).spellName = (copy as SpellRoll).spellName;
		(this as any).spellSrc = (copy as SpellRoll).spellSrc;

		console.log("Copy ComplexFormRoll data to ConfiguredRoll");
		(this as any).form = (copy as ComplexFormRoll).form;
		(this as any).calcFade = (copy as ComplexFormRoll).calcFade;
		(this as any).defenseRating = (copy as ComplexFormRoll).defenseRating;
		(this as any).attackRating = (copy as ComplexFormRoll).attackRating;
		(this as any).formDesc = (copy as ComplexFormRoll).formDesc;
		(this as any).formId = (copy as ComplexFormRoll).formId;
		(this as any).formName = (copy as ComplexFormRoll).formName;
		(this as any).formSrc = (copy as ComplexFormRoll).formSrc;
	}
}

/**
 * Data to show in a ChatMessage
 */
export class SR6ChatMessageData {
	speaker: ChatSpeakerDataProperties;
	actor: Shadowrun6Actor;

	/**
	 * Text to describe what is happening,  e.g. <i>X is shooting at Y</i>
	 */
	actionText: string;

	rollType: RollType;
	//rollMode : "publicroll" | "gmroll" | "blindroll" | "selfroll" | undefined;

	/* Opposed rolls: How to oppose? */
	defendWith: Defense;
	isOpposed: boolean;
	edge_message: string;
	edgeAdjusted: number;
	edge_use: string;
	/** Edge action selected  */
	edgeAction: string;

	/** How many dice have been rolled */
	pool: number;
	/** Was there a threshold? */
	threshold: number | undefined;

	configured: ConfiguredRoll;
	tooltip: string;
	results: string | DiceTerm.Result[];
	formula: string;
	publicRoll: boolean;

	total: number;
	success: boolean;
	glitch: boolean;
	criticalglitch: boolean;

	targets : TokenData[] | null;
	/** Damage after adjustment (Amp Up, Fire Mode ...) */
	damage: number;
	/** Which monitor to apply damage to */
	monitor: MonitorType;

	damageAfterSoakAlreadyApplied: boolean;
	nettoHits: number;

	constructor(copy: ConfiguredRoll) {
		console.log("####SR6ChatMessageData####1###", copy);
		this.speaker = copy.speaker;
		this.actor = copy.actor;
		this.actionText = copy.actionText;
		this.rollType = copy.rollType;
		this.defendWith = copy.defendWith;
		this.threshold = copy.threshold;
		this.pool = copy.pool;
		this.isOpposed = this.defendWith != undefined;
		this.edge_message = copy.edge_message;
		this.edge_use = copy.edge_use;
		this.edgeAction = copy.edgeAction;
		this.targets = copy.targetIds;
		console.log("####SR6ChatMessageData####2###", this);
	}
}
