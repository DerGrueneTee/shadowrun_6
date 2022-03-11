import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import { Lifeform, Skill } from "../ActorTypes.js";
import { Defense } from "../config.js";
import { EdgeBoost, SkillDefinition } from "../DefinitionTypes.js";
import { Spell } from "../ItemTypes.js";
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

export class ConfiguredRoll extends PreparedRoll {
	edgeBoost:string;
	modifier : number = 0;
	buttonType : ReallyRoll;
	explode : boolean;
	defRating : number;
}

export class FinishedRoll extends ConfiguredRoll {
	success : boolean;
	glitch  : boolean;
	criticalglitch : boolean;
}
