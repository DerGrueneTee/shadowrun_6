import { doRoll } from "../module/dice/dice.js";
import { doAttackRoll } from "../module/dice/dice.js";
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
		this._prepareSkills();
		this._prepareItemPools();
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
			
			data.initiative.actions = data.initiative.physical.dicePool +1;

			data.initiative.astral.base = data.attributes["log"].pool + data.attributes["int"].pool;
			data.initiative.astral.pool = data.initiative.astral.base + data.initiative.astral.mod;
			data.initiative.astral.dicePool = data.initiative.astral.dice + data.initiative.astral.diceMod;
		}
		
		/* (Unarmed) Attack and Defense Rating */
		if (data.derived) {
			// Attack Rating
			data.derived.attack_rating.base = data.attributes["rea"].pool + data.attributes["str"].pool;
			data.derived.attack_rating.pool = data.derived.attack_rating.base + data.derived.attack_rating.mod;
			// Defense Rating
			if (data.derived.defense_rating) {				
				data.derived.defense_rating.base = data.attributes["bod"].pool;
				data.derived.defense_rating.pool = data.derived.defense_rating.base + data.derived.defense_rating.mod;
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
			
			const items = this.data.items;
			// Soak / Damage Resistance
			if (data.derived.resist_damage) {				
				data.derived.resist_damage.base = data.attributes["bod"].pool;
				items.forEach(function(item, key) {
					if (item.type=="gear" && item.data.data.type=="ARMOR") {
						console.log("Armor of "+item.name+" is "+item.data.data.defense);
					}
				});
				
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
	 * Calculate the final attribute values
	 */
	_prepareSkills() {
		const actorData = this.data;
		const data = this.data.data;
		console.log("PrepareSkills " + this.name);
		// Only calculate for PCs - ignore for NPCs/Critter
		if (actorData.type === "Player" || actorData.type === "NPC") {
			CONFIG.SR6.ATTRIB_BY_SKILL.forEach(function(skillDef, id) {
				let attr = skillDef.attrib;
				let attribVal = data.attributes[attr].pool;
				data.skills[id].pool = attribVal + data.skills[id].points;
			});
		}
	}

	//---------------------------------------------------------
	/*
	 * Calculate the pool when using items with assigned skills
	 */
	_prepareItemPools() {
		const actorData = this.data;
		console.log("_prepareItemPools " + this.name);

		actorData.items.forEach(tmpItem => {
			let item = tmpItem.data;
			if (item.type == "gear" && item.data && item.data.skill) {
				item.data.pool = tmpItem.actor.data.data.skills[item.data.skill].pool; 
				// TODO: Check if actor has specialization or mastery
				item.data.pool = item.data.pool + eval(item.data.modifier); 
				console.log("Pool for item " + item.name + ": " + item.data.pool);
			};
		});
		console.log("_prepareItemPools done");
	}

	/**
	 * Roll a Skill Check
	 * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
	 * @param {string} skillId      The skill id (e.g. "ins")
	 * @param {Object} options      Options which configure how the skill check is rolled
	 * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
	 */
	rollSkill(skillId, options = {}) {
		//    	let skl = "";
		//    	this.items.forEach(loopItem => {
		//    		let item = loopItem.data;
		//    		if (item.type == "skill-value") {
		//    			if (item.data.id==skillId) {
		//    				console.log("Found "+skillId+" with "+item.data.id);
		//    				skl = item.data;
		//    			}
		//    		}
		//    	});
		const skl = this.data.data.skills[skillId];
		//const skl = this.getOwnedItem(itemID);
		const value = skl.pool;
		const parts = [];


		// Roll and return
		let data = mergeObject(options, {
			parts: parts,
			value: value,
			title: game.i18n.localize("skill." + skillId),
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
