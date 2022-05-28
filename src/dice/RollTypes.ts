import { ChatMessageData           } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import { Lifeform, Monitor, Skill } from "../ActorTypes.js";
import { Defense, MonitorType } from "../config.js";
import { EdgeBoost, MatrixAction, SkillDefinition } from "../DefinitionTypes.js";
import { Gear, Spell, Weapon } from "../ItemTypes.js";
import { Shadowrun6Actor } from "../Shadowrun6Actor.js";

export enum RollType {
	Common = "common",
	Weapon = "weapon",
	Spell = "spell",
	Ritual = "ritual",
	ComplexForm = "complexform",
	MatrixAction  = "matrix",
	/** Defense is a way to reduce netto hits */
	Defense = "defense",
	/** Reduce netto damage */
	Soak    = "soak",
	/** Directly apply the given damage */
	Damage  = "damage"
}

export enum SoakType {
	DAMAGE_STUN     = "damage_stun",
	DAMAGE_PHYSICAL = "damage_phys",
	DRAIN           = "drain",
	FADING          = "fading",
}

export enum ReallyRoll {
	ROLL,
	AUTOHITS
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
	
	rollType : RollType;
	
	/* Opposed rolls: How to oppose? */
	defendWith: Defense;
	get isOpposed() : boolean {
		return this.defendWith != undefined;
	}
	
	threshold : number;
	/* Use a wild die */
	useWildDie : number = 0;
	rollMode : "publicroll" | "gmroll" | "blindroll" | "selfroll" | undefined;
	
	/* How many dice shall be rolled */
	pool: number;
	
	copyFrom(copy : CommonRollData) {
		this.speaker = copy.speaker;
		this.actor   = copy.actor;
		this.title   = copy.title;
		this.actionText = copy.actionText;
		this.checkText  = copy.checkText;
		this.rollType   = copy.rollType;
		this.defendWith = copy.defendWith;
		this.threshold  = copy.threshold;
		this.useWildDie = copy.useWildDie;
		this.pool       = copy.pool;
	}
}

/************************************
 * Returned after
 ************************************/
export interface OpposedRoll {
	defendWith : Defense;
	attackRating : number;
	defenseRating: number;
}

enum PoolUsage {
	OneForOne,
	OneForAll,
}

export interface AttackRollData {
	defendWith : Defense;

	/** Which tokens are selected */
	targets?    : IterableIterator<Token> | null;
	
	attackRating? : number;
	weaponAttackRating? : number[];
	
	poolUsage     : PoolUsage;
	/** when poolUsage is OneOnOne: How large is your pool per Token*/
	perTargetPool : Map<Token, number>;
}

export interface WeaponRollData extends AttackRollData {
	weapon   : Weapon;
}

export interface SpellRollData extends AttackRollData {
	spell    : Spell;
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
	
	copyFrom(copy : PreparedRoll) {
		super.copyFrom(copy);
		this.allowBuyHits = copy.allowBuyHits;
		this.freeEdge     = copy.freeEdge;
		this.edge         = copy.edge;
		this.edgeBoosts   = copy.edgeBoosts;
		this.performer = copy.performer;
	}
}

export class DefenseRoll extends PreparedRoll {	
	damage : number;
	
	constructor(threshold : number) {	
		super();
		this.rollType = RollType.Defense;
		this.threshold = threshold;
	}
}

export class SoakRoll extends PreparedRoll {
	monitor : MonitorType;
	// Eventually add effects
	
	constructor(threshold : number) {	
		super();
		this.rollType = RollType.Soak;
		this.threshold = threshold;
	}
}

export class SkillRoll extends PreparedRoll {
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

	
	copyFrom(copy : SkillRoll) {
		super.copyFrom(copy);
		this.skillId  = copy.skillId;
		this.skillDef = copy.skillDef;
		this.skillValue = copy.skillValue;
		this.attrib   = copy.attrib;
	}

	/**
	 * Execute
	 */
	prepare(actor: Shadowrun6Actor): void {

	}
}

export class SpellRoll extends SkillRoll {
	rollType = RollType.Spell;
	
	item   : Item;
	itemId : string;
	spellId : string;
	spellName : string | null;
	spellDesc : string | null;
	spellSrc: string | null;
	spell: Spell;
	/** Radius of spells with area effect - may be increased */
	calcArea : number = 2;
	calcDrain : number;
	/** Damage of combat spells - may be amped up */
	calcDamage : number = 0;
	canAmpUpSpell: boolean;
	canIncreaseArea: boolean;
	defenseRating : number;
	attackRating  : number;

	/**
	 * @param skill {Skill}   The skill to roll upon
	 */
	constructor(actor: Lifeform, item: Item, itemId:string, spellItem: Spell) {
		super(actor, "sorcery");
		this.item      = item;
		this.itemId    = itemId;
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

function isWeapon(obj: any): obj is Weapon {
    return obj.attackRating != undefined;
}

export class WeaponRoll extends SkillRoll implements OpposedRoll {
	rollType = RollType.Weapon;
	
	item   : Item;
	itemId : string;
	itemName : string | null;
	itemDesc : string | null;
	itemSrc: string | null;
	gear   : Gear;
	weapon : Weapon;
	targets : IterableIterator<Token>;
	defenseRating : number;
	attackRating  : number;
	/** Effective attack rating after applying firing mode */
	calcAttackRating:Array<number> = [0,0,0,0,0];
	/** Effective damage */
	calcDmg: number;
	/** How many units of ammunition are required */
	calcRounds : number;
	fireMode : string;
	burstMode: string | undefined;
	faArea: string | undefined;
	
	constructor(actor: Lifeform, item: Item, itemId:string, gear:Gear) {
		super(actor, (item.data.data as any).skill);
		this.item      = item;
		this.itemId    = itemId;
		this.gear      = gear;
		this.skillSpec = this.gear.skillSpec;
		if (isWeapon(gear)) {
			this.weapon = gear;
			this.rollType = RollType.Weapon;
			this.defendWith = Defense.PHYSICAL;
		}
	}
}

export class MatrixActionRoll extends SkillRoll {
	rollType = RollType.MatrixAction;	
	itemName: string | null;
	itemDesc: string | null;
	itemSrc : string | null;
	action  : MatrixAction;
	targets : IterableIterator<Token>;
	defenseRating : number;
	attackRating  : number;
	
	constructor(actor: Lifeform, action:MatrixAction) {
		super(actor,action.skill);
		this.action    = action;
		this.skillSpec = this.action.spec;
	}
}

export class ConfiguredRoll extends PreparedRoll {
	edgeBoost:string;
	modifier : number = 0;
	buttonType : ReallyRoll;
	explode : boolean;
	defRating : number;
   edgePlayer: number;
	edgeTarget : number;
	edge_message : string;
	edgeAdjusted : number;
	edge_use : string;
	/** Edge action selected  */
	edgeAction : string;
	targets : IterableIterator<Token>;
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
	
	rollType : RollType;
	//rollMode : "publicroll" | "gmroll" | "blindroll" | "selfroll" | undefined;
	
	/* Opposed rolls: How to oppose? */
	defendWith: Defense;
	get isOpposed() : boolean {
		return this.defendWith != undefined;
	}
	
	/** How many dice have been rolled */
	pool		 : number;
	/** Was there a threshold? */
	threshold : number | undefined;

	configured : ConfiguredRoll;
   tooltip   : string;
   results   : string | DiceTerm.Result[];
   formula   : string;
	publicRoll : boolean;

	total   : number;
	success : boolean;
	glitch  : boolean;
	criticalglitch : boolean;
	
	/** Damage after adjustment (Amp Up, Fire Mode ...) */
	damage    : number;
	/** Which monitor to apply damage to */
	monitor   : MonitorType;
	
	damageAfterSoakAlreadyApplied : boolean;
	nettoHits : number;
	
	constructor(copy : PreparedRoll) {
		this.speaker = copy.speaker;
		this.actor   = copy.actor;
		this.actionText = copy.actionText;
		this.rollType   = copy.rollType;
		this.defendWith = copy.defendWith;
		this.threshold  = copy.threshold;
		this.pool       = copy.pool;
	}
}
