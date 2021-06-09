import { doRoll } from "../module/dice/dice.js";
import { doAttackRoll } from "./dice/CombatRoll.js";
import { doCommonCheck } from "../module/dice/dice.js";
import { SR6 } from "./config.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Shadowrun6Actor extends Actor {

	/** @Override */
	prepareData() {
		super.prepareData();
		console.log("Shadowrun6Actor.prepareData() " + this.data.name);

		const data = this.data.data;
		this._prepareAttributes();
		this._prepareDerivedAttributes();
		this._prepareDefensesRatings();
		this._prepareSkills();
		this._prepareResistPools();
		this._prepareItemPools();
		this._calculateEssense();
	}

	//---------------------------------------------------------
	/*
	 * Calculate the final attribute values
	 */
	async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
		console.log("modifyTokenAttribute " + attribute);
		if (attribute == "stun" || attribute == "physical") {
			const current = getProperty(this.data.data, attribute);
			current.dmg = current.max - value;
			if (current.dmg < 0) current.dmg = 0;
			console.log("damage is " + current.dmg);
			this.update({ [`data.${attribute}.dmg`]: current.dmg });
		}
		return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
	}


	//---------------------------------------------------------
	/*
	 * Calculate the final attribute values
	 */
	_prepareAttributes() {
		const actorData = this.data;
		const data = this.data.data;
		// Only calculate for PCs - ignore for NPCs/Critter
		if (actorData.type === "Player" || actorData.type === "NPC") {
			CONFIG.SR6.ATTRIBUTES.forEach(attr => {
				data.attributes[attr].pool =
					parseInt(data.attributes[attr].base || 0)
					+ parseInt(data.attributes[attr].mod || 0);
			});
		}
	}

	//---------------------------------------------------------
	/*
	 * Calculate the attributes like Initiative
	 */
	_prepareDerivedAttributes() {
		const actorData = this.data;
		const data = this.data.data;

		// Store volatile

		if (actorData.type === "Player" || actorData.type === "NPC") {
			if (data.physical) {
				data.physical.base = 8 + Math.round(data.attributes["bod"].pool / 2);
				data.physical.max = data.physical.base + data.physical.mod;
				data.physical.value = data.physical.max - data.physical.dmg;
			}

			if (data.stun) {
				data.stun.base = 8 + Math.round(data.attributes["wil"].pool / 2);
				data.stun.max = data.stun.base + data.stun.mod;
				data.stun.value = data.stun.max - data.stun.dmg;
			}
		}

		if (data.initiative) {
			data.initiative.physical.base = data.attributes["rea"].pool + data.attributes["int"].pool;
			data.initiative.physical.pool = data.initiative.physical.base + data.initiative.physical.mod;
			data.initiative.physical.dicePool = Math.min(5, data.initiative.physical.dice + data.initiative.physical.diceMod);

			data.initiative.actions = data.initiative.physical.dicePool + 1;

			data.initiative.astral.base = data.attributes["log"].pool + data.attributes["int"].pool;
			data.initiative.astral.pool = data.initiative.astral.base + data.initiative.astral.mod;
			data.initiative.astral.dicePool = data.initiative.astral.dice + data.initiative.astral.diceMod;
		}

		const items = this.data.items;
		/* (Unarmed) Attack and Defense Rating */
		if (data.derived) {
			// Attack Rating
			data.derived.attack_rating.base = data.attributes["rea"].pool + data.attributes["str"].pool;
			data.derived.attack_rating.pool = data.derived.attack_rating.base + data.derived.attack_rating.mod;
			// Defense Rating
			if (data.derived.defense_rating) {
				data.derived.defense_rating.base = data.attributes["bod"].pool;
				data.derived.defense_rating.modString = game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
				if (data.derived.defense_rating.mod) {
					data.derived.defense_rating.pool = data.derived.defense_rating.base + data.derived.defense_rating.mod;
					data.derived.defense_rating.modString += "\n+" + data.derived.defense_rating.mod;
				} else {
					data.derived.defense_rating.pool = data.attributes["bod"].pool;
				}
				items.forEach(function (item, key) {
					if (item.type == "gear" && item.data.data.type == "ARMOR") {
						if (item.data.data.usedForPool) {
							data.derived.defense_rating.pool += item.data.data.defense;
							data.derived.defense_rating.modString += "\n+" + item.data.data.defense + " " + item.name;
						}
					}
				});
			}
			// Composure
			if (data.derived.composure) {
				data.derived.composure.base = data.attributes["wil"].pool + data.attributes["cha"].pool;
				data.derived.composure.pool = data.derived.composure.base + data.derived.composure.mod;
			}
			// Judge Intentions
			if (data.derived.judge_intentions) {
				data.derived.judge_intentions.base = data.attributes["wil"].pool + data.attributes["int"].pool;
				data.derived.judge_intentions.pool = data.derived.judge_intentions.base + data.derived.judge_intentions.mod;
			}
			// Memory
			if (data.derived.memory) {
				data.derived.memory.base = data.attributes["log"].pool + data.attributes["int"].pool;
				data.derived.memory.pool = data.derived.memory.base + data.derived.memory.mod;
			}
			// Lift/Carry
			if (data.derived.lift_carry) {
				data.derived.lift_carry.base = data.attributes["bod"].pool + data.attributes["wil"].pool;
				data.derived.lift_carry.pool = data.derived.lift_carry.base + data.derived.lift_carry.mod;
			}

			// Soak / Damage Resistance
			if (data.derived.resist_damage) {
				data.derived.resist_damage.base = data.attributes["bod"].pool;
				data.derived.resist_damage.pool = data.derived.resist_damage.base + data.derived.resist_damage.mod;
			}
			// Toxin Resistance
			if (data.derived.resist_toxin) {
				data.derived.resist_toxin.base = data.attributes["bod"].pool + data.attributes["wil"].pool;
				data.derived.resist_toxin.pool = data.derived.resist_toxin.base + data.derived.resist_toxin.mod;
			}
		}
	}

	//---------------------------------------------------------
	/*
	 * Calculate the attributes like Initiative
	 */
	_prepareDefensesRatings() {
		const actorData = this.data;
		const data = this.data.data;
		const items = this.data.items;

		// Store volatile

		if (actorData.type === "Player" || actorData.type === "NPC") {
			if (!data.defenserating) {
				data.defenserating = {};
				data.defenserating.physical = {};
				data.defenserating.astral = {};
				data.defenserating.social = {};
			}
			if (!data.defenserating.physical)  data.defenserating.physical = {};
			if (!data.defenserating.astral)  data.defenserating.astral = {};
			if (!data.defenserating.social)  data.defenserating.social = {};
			
			
			// Physical Defense Rating
			data.defenserating.physical.base = data.attributes["bod"].pool;
			data.defenserating.physical.modString = game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
			data.defenserating.physical.pool = data.defenserating.physical.base;
			if (data.defenserating.physical.mod) {
				data.defenserating.physical.pool += data.defenserating.physical.mod;
				data.defenserating.physical.modString += "<br/>\n+" + data.defenserating.physical.mod;
			} 
			items.forEach(function (item, key) {
				if (item.type == "gear" && item.data.data.type == "ARMOR") {
					if (item.data.data.usedForPool) {
						data.defenserating.physical.pool += item.data.data.defense;
						data.defenserating.physical.modString += "\n+" + item.data.data.defense + " " + item.name;
					}
				}
			});
			
			// Astral Defense Rating
			data.defenserating.astral.base = data.attributes["int"].pool;
			data.defenserating.astral.modString = game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defenserating.astral.pool = data.defenserating.physical.base;
			if (data.defenserating.astral.mod) {
				data.defenserating.astral.pool += data.defenserating.astral.mod;
				data.defenserating.astral.modString += "\n+" + data.defenserating.astral.mod;
			} 
			
			// Social Defense Rating
			data.defenserating.social.base = data.attributes["cha"].pool;
			data.defenserating.social.modString = game.i18n.localize("attrib.cha_short") + " " + data.attributes["cha"].pool;
			data.defenserating.social.pool = data.defenserating.social.base;
			if (data.defenserating.social.mod) {
				data.defenserating.social.pool += data.defenserating.social.mod;
				data.defenserating.social.modString += "\n+" + data.defenserating.social.mod;
			} 
			items.forEach(function (item, key) {
				if (item.type == "gear" && item.data.data.type == "ARMOR") {
					if (item.data.data.usedForPool) {
						data.defenserating.social.pool += item.data.data.social;
						data.defenserating.social.modString += "\n+" + item.data.data.social + " " + item.name;
					}
				}
			});
		}
	}

	//---------------------------------------------------------
	/*
	 * Calculate the final attribute values
	 */
	_prepareSkills() {
		const actorData = this.data;
		const data = this.data.data;
		console.log("PrepareSkills " + this.name);
		// Only calculate for PCs - ignore for NPCs/Critter
		if (actorData.type === "Player" || actorData.type === "NPC") {
			CONFIG.SR6.ATTRIB_BY_SKILL.forEach(function (skillDef, id) {
				let attr = skillDef.attrib;
				let attribVal = data.attributes[attr].pool;
				data.skills[id].pool = attribVal + data.skills[id].points;
				if (data.skills[id].points==0 && !skillDef.useUntrained) {
					data.skills[id].pool--;
				}
				
				
				data.skills[id].poolS = attribVal + data.skills[id].points;
				data.skills[id].poolE = attribVal + data.skills[id].points;
				if (data.skills[id].specialization)
					data.skills[id].poolS = data.skills[id].pool+2;
				if (data.skills[id].expertise)
					data.skills[id].poolE = data.skills[id].pool+3;
			});
		}
	}

	//---------------------------------------------------------
	/*
	 * Calculate the attributes like Initiative
	 */
	_prepareResistPools() {
		const actorData = this.data;
		const data = this.data.data;

		// Store volatile

		if (actorData.type === "Player" || actorData.type === "NPC") {
			if (!data.resist) {
				data.resist = {};
				data.resist.attacks = {};
				data.resist.damage = {};
				data.resist.astral_direct = {};
				data.resist.astral_indirect = {};
				data.resist.toxin = {};
			}
			if (!data.resist.attacks)  data.resist.attacks = {};
			if (!data.resist.damage)  data.resist.damage = {};
			if (!data.resist.astral_direct)  data.resist.astral_direct = {};
			if (!data.resist.astral_indirect)  data.resist.astral_indirect = {};
			if (!data.resist.toxin)  data.resist.toxin = {};
			
			// Physical Defense Test
			data.resist.attacks.base = data.attributes["rea"].pool+ data.attributes["int"].pool;
 			data.resist.attacks.modString = "\n"+game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
 			data.resist.attacks.modString += "\n"+game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.resist.attacks.pool = data.resist.attacks.base;
			if (data.resist.attacks.mod) {
				data.resist.attacks.pool += data.resist.attacks.mod;
				data.resist.attacks.modString += "\n+" + data.resist.attacks.mod;
			} 
			
			// Resist damage
			data.resist.damage.base = data.attributes["bod"].pool;
 			data.resist.damage.modString = "\n"+game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
			data.resist.damage.pool = data.resist.damage.base;
			if (data.resist.damage.mod) {
				data.resist.damage.pool += data.resist.damage.mod;
				data.resist.damage.modString += "\n+" + data.resist.damage.mod;
			} 
			
			// Direct compat spell defense test
			data.resist.astral_direct.base = data.attributes["wil"].pool+ data.attributes["int"].pool;
 			data.resist.astral_direct.modString = "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
 			data.resist.astral_direct.modString += "\n"+game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.resist.astral_direct.pool = data.resist.astral_direct.base;
			if (data.resist.astral_direct.mod) {
				data.resist.astral_direct.pool += data.resist.astral_direct.mod;
				data.resist.astral_direct.modString += "\n+" + data.resist.astral_direct.mod;
			} 
			
			// Indirect compat spell defense test
			data.resist.astral_indirect.base = data.attributes["rea"].pool+ data.attributes["wil"].pool;
 			data.resist.astral_indirect.modString = "\n"+game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
 			data.resist.astral_indirect.modString += "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.resist.astral_indirect.pool = data.resist.astral_indirect.base;
			if (data.resist.astral_indirect.mod) {
				data.resist.astral_indirect.pool += data.resist.astral_indirect.mod;
				data.resist.astral_indirect.modString += "\n+" + data.resist.astral_indirect.mod;
			} 
			
			// Resist toxin
			data.resist.toxin.base = data.attributes["bod"].pool+ data.attributes["wil"].pool;
 			data.resist.toxin.modString = "\n"+game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
 			data.resist.toxin.modString += "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.resist.toxin.pool = data.resist.toxin.base;
			if (data.resist.toxin.mod) {
				data.resist.toxin.pool += data.resist.astral_indirect.mod;
				data.resist.toxin.modString += "\n+" + data.resist.toxin.mod;
			} 
		}
	}
	//---------------------------------------------------------
	/*
	 * Calculate the pool when using items with assigned skills
	 */
	_prepareItemPools() {
		const actorData = this.data;

		actorData.items.forEach(tmpItem => {
			let item = tmpItem.data;
			if (item.type == "gear" && item.data && item.data.skill) {
				item.data.pool = tmpItem.actor.data.data.skills[item.data.skill].pool;
				// TODO: Check if actor has specialization or mastery
				item.data.pool = item.data.pool + eval(item.data.modifier);
			};
		});
	}

	//---------------------------------------------------------
	/*
	 * Calculate the attributes like Initiative
	 */
	_calculateEssense() {
		const actorData = this.data;
		const data = this.data.data;
		
		let essence = 6.0;
		actorData.items.forEach(tmpItem => {
			let item = tmpItem.data;
			if (item.type == "gear" && item.data && item.data.essence) {
				essence -= item.data.essence;
			};
		});
		data.essence = Number((essence).toFixed(2));
	}

	//---------------------------------------------------------
	/**
	 * Roll a Skill Check
	 * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
	 * @param {string} skillId      The skill id (e.g. "ins")
	 * @param {Object} options      Options which configure how the skill check is rolled
	 * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
	 */
	rollSkill(skillId, options = {}) {
		const skl = this.data.data.skills[skillId];
		let rollName = game.i18n.localize("skill." + skillId);
		let value = skl.pool;
		if (options.spec) {
			rollName += "("+game.i18n.localize("shadowrun6.special." + skillId+"."+options.spec)+")";
			if (options.spec==skl.expertise) {
				value+=3;
			} else if (options.spec==skl.specialization) {
				value+=2;
			}
		}
		const parts = [];

		// Roll and return
		let data = mergeObject(options, {
			parts: parts,
			value: value,
			title: rollName,
			skill: skl
		});
		data.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(data);
	}

	rollItem(skillId, itemId, options = {}) {
		const skl = this.data.data.skills[skillId];
		const item = this.items.get(itemId);
		const value = skl.pool;
		const parts = [];
		let targetId = this.userHasTargets() ? this.getUsersFirstTargetId() : null;
		let title = item.name + " (" + game.i18n.localize("skill." + skillId) + ")";

		let data = mergeObject(options, {
			parts: parts,
			value: value,
			title: title,
			skill: skl,
			item: item,
			targetId: targetId,
			attackType: "weapon",
			buyHits: false
		});
		data.speaker = ChatMessage.getSpeaker({ actor: this });
		return doAttackRoll(data);
	}

	rollSpell(itemId, options = {}) {
		const skl = this.data.data.skills["sorcery"];
		const item = this.items.get(itemId);
		let value = parseInt(skl.pool);
		const parts = [];
		let hasSpec = skl.specialization === "spellcasting";
		let hasExp = skl.expertise === "spellcasting";
		let isCombat = item.data.data.category === "combat";
		let targetId = this.userHasTargets() ? this.getUsersFirstTargetId() : null;
		let title;
		if (hasExp) {
			title = item.name + " (" + game.i18n.localize("shadowrun6.roll.exp") + ")";
			value += 3;
		} else if (hasSpec) 	{
			title = item.name + " (" + game.i18n.localize("shadowrun6.roll.spec") + ")";
			value += 2; 
		} else {
			title = item.name;
		}

		let data = mergeObject(options, {
			parts: parts,
			value: value,
			title: title,
			skill: skl,
			item: item,
			targetId: targetId,
			isCombat: isCombat,
			attackType: "spell",
			buyHits: true
		});
		data.speaker = ChatMessage.getSpeaker({ actor: this });
		return doAttackRoll(data);
	}


	rollCommonCheck(pool, title, dialogConfig, options = {}) {
		let data = mergeObject(options, {
			value: pool,
			title: title,
			dialogConfig: dialogConfig	
		});
		data.speaker = ChatMessage.getSpeaker({actor: this});
		return doCommonCheck(data);
	}

	getUsersFirstTargetId() {
		if (this.userHasTargets()) {
			return game.user.targets.values().next().value.data.actorId;
		} else {
			return null;
		}
	}

	userHasTargets() {
		let user = game.user;
		return user.targets.size > 0;
	}

	async rollAttack(attackId, options = {}) {
		console.log("rollAttack(" + attackId + ", options=" + options + ")");
		const actorData = this.data.data;
		console.log("NOT IMPLEMENTED YET");
	}

}
