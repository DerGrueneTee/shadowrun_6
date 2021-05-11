import { doRoll } from "../module/dice/dice.js";
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

		console.log("TODO: calculate derived attributes for " + this.data.type);
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
			  console.log("Set Physical to " + data.physical.max+" = 8+"+ +Math.round(data.attributes["bod"].pool / 2)+" + "+data.physical.mod);
			  console.log("Set Physical to " + data.physical.max+" = 8+"+ +Math.round(data.attributes["bod"].pool / 2)+" + "+data.physical.mod);
			}
			
			if (data.stun) {
			data.stun.base = 8 + Math.round(data.attributes["wil"].pool / 2);
			data.stun.max = data.stun.base + data.stun.mod;
			data.stun.value = data.stun.max - data.stun.dmg;

			console.log("Set Stun to " + data.stun.max+" = 8+"+ +Math.round(data.attributes["wil"].pool / 2)+" + "+data.stun.mod);
			}
		}

		if (data.initiative) {
			data.initiative.physical.base = data.attributes["rea"].pool + data.attributes["int"].pool;
			data.initiative.physical.pool = data.initiative.physical.base + data.initiative.physical.mod;
			data.initiative.physical.dicePool = data.initiative.physical.dice + data.initiative.physical.diceMod;
			console.log("Initiative: "+data.initiative.physical.dicePool);

			data.initiative.astral.base = data.attributes["log"].pool + data.attributes["int"].pool;
			data.initiative.astral.pool = data.initiative.astral.base + data.initiative.astral.mod;
			data.initiative.astral.dicePool = data.initiative.astral.dice + data.initiative.astral.diceMod;
		}
	}

	//---------------------------------------------------------
	/*
	 * Calculate the final attribute values
	 */
	_prepareSkills() {
		const actorData = this.data;
		const data = this.data.data;
		console.log("PrepareSkills "+this.name);
		// Only calculate for PCs - ignore for NPCs/Critter
		if (actorData.type === "Player" || actorData.type === "NPC") {
			/*
			actorData.items.forEach(tmpItem => {
				let item = tmpItem.data;
				if (item.type == "skill-value" && item.data.id != "knowledge" && item.data.id != "language") {
					try {
						let skillDef = CONFIG.SR6.ATTRIB_BY_SKILL.get(item.data.id);
						if (!skillDef) {
							console.log("No skill definition for " + skillDef);
						}
						let attr = skillDef.attrib;
						let attribVal = data.attributes[attr].pool;
						item.data.pool = attribVal + item.data.points;
					} catch (e) {
						console.log("Error for skill " + item.data.id + ": " + e);
					}
				};
			});
			*/

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
		console.log("_prepareItemPools "+this.name);
		
		actorData.items.forEach(tmpItem => {
			let item = tmpItem.data;
			if (item.type == "gear" && item.data && item.data.skill) {
				item.data.pool = tmpItem.actor.data.data.skills[item.data.skill].pool;
				// TODO: Check if actor has specialization or mastery
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

		// Roll and return
		let data = mergeObject(options, {
			parts: parts,
			value: value,
			title: item.name + " ("+game.i18n.localize("skill." + skillId) +")",
			skill: skl,
			item: item
		});
		data.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(data);
	}


    async rollAttack(attackId, options = {}) {
		  console.log("rollAttack("+attackId+", options="+options+")");
        const actorData = this.data.data;
		  console.log("NOT IMPLEMENTED YET");
    }

}
