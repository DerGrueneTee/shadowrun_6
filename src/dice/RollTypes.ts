import { ChatMessageData           } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import { Lifeform, Skill } from "../ActorTypes.js";
import { Defense } from "../config.js";
import { EdgeBoost, SkillDefinition } from "../DefinitionTypes.js";
import { Gear, Spell } from "../ItemTypes.js";
import { Shadowrun6Actor } from "../Shadowrun6Actor.js";

export enum RollType {
	Common,
	Weapon,
	Spell,
	Ritual,
	ComplexForm
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
	defendWith: Defense |undefined;
	isOpposed() : boolean {
		return this.defendWith != undefined;
	}
	
	threshold : number;
	/* Use a wild die */
	useWildDie : number = 0;
	
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
	
	copyFrom(copy : PreparedRoll) {
		super.copyFrom(copy);
		this.allowBuyHits = copy.allowBuyHits;
		this.freeEdge     = copy.freeEdge;
		this.edge         = copy.edge;
		this.edgeBoosts   = copy.edgeBoosts;
	}
}

export class SkillRoll extends PreparedRoll {
	skillId: string;
	skillDef: SkillDefinition;
	skillValue: Skill;
	skillSpec: string;
	attrib: string | undefined;
	performer: Lifeform;

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
		this.performer = copy.performer;
	}

	/**
	 * Execute
	 */
	prepare(actor: Shadowrun6Actor): void {

	}
}

export class SpellRoll extends SkillRoll {
	rollType = RollType.Spell;
	
	spell: Spell;
	canAmpUpSpell: boolean;
	canIncreaseArea: boolean;

	/**
	 * @param skill {Skill}   The skill to roll upon
	 */
	constructor(actor: Lifeform, spellItem: Spell) {
		super(actor, "sorcery");
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
	}
}

export class ItemRoll extends SkillRoll {
	rollType = RollType.Weapon;
	
	item   : Item;
	itemId : string;
	gear   : Gear;
	
	constructor(actor: Lifeform, item: Item, itemId:string) {
		super(actor, (item.data.data as any).skill);
		this.item      = item;
		this.itemId    = itemId;
		this.gear      = item.data.data as Gear;
		this.skillSpec = this.gear.skillSpec;
	}
}

export class ConfiguredRoll extends PreparedRoll {
	edgeBoost:string;
	modifier : number = 0;
	buttonType : ReallyRoll;
	explode : boolean;
	defRating : number;
}

export class FinishedRoll extends PreparedRoll {
	configured : ConfiguredRoll;
	success    : boolean;
	glitch  : boolean;
	criticalglitch : boolean;
	total   : number;
   tooltip : string;
    results: string | DiceTerm.Result[];
    formula: string;
	publicRoll : boolean;
	
	
	constructor(copy : PreparedRoll) {
		super();
		super.copyFrom(copy);
	}
}
