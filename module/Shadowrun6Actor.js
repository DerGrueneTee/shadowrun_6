import { doRoll } from "../module/dice/dice.js";
import { doAttackRoll } from "../module/dice/dice.js";
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
		this._prepareDefenses();
		this._prepareSkills();
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
	_prepareDefenses() {
		const actorData = this.data;
		const data = this.data.data;

		// Store volatile

		if (actorData.type === "Player" || actorData.type === "NPC") {
			// Physical Defense Rating
			data.defense.physical.base = data.attributes["bod"].pool;
			data.defense.physical.modString = game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
			data.derived.defense_rating.pool = data.defense.physical.base;
			if (data.defense.physical.mod) {
				data.defense.physical.pool += data.defense.physical.mod;
				data.defense.physical.modString += "\n+" + data.defense.physical.mod;
			} 
			items.forEach(function (item, key) {
				if (item.type == "gear" && item.data.data.type == "ARMOR") {
					if (item.data.data.usedForPool) {
						data.defense.physical.pool += item.data.data.defense;
						data.defense.physical.modString += "\n+" + item.data.data.defense + " " + item.name;
					}
				}
			});
			
			// Astral Defense Rating
			data.defense.astral.base = data.attributes["int"].pool;
			data.defense.astral.modString = game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.derived.defense_rating.pool = data.defense.physical.base;
			if (data.defense.astral.mod) {
				data.defense.astral.pool += data.defense.astral.mod;
				data.defense.astral.modString += "\n+" + data.defense.astral.mod;
			} 
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
			targetId: targetId
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
