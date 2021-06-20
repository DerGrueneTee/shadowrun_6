import { doRoll } from "./dice/CommonRoll.js";
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
		this._prepareAttackRatings();
		this._prepareDefenseRatings();
		this._prepareSkills();
		this._prepareDefensePools();
		this._prepareItemPools();
		this._calculateEssense();
		
		if (!data.tradition) {
			data.tradition = {
				"name": "",
				"attribute": "log"
			};
		}
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

	//---------------------------------------------------------
	/*
	 * Calculate the attack ratings
	 */
	_prepareAttackRatings() {
		const actorData = this.data;
		const data = this.data.data;
		const items = this.data.items;

		if (!data.attackrating) {
			data.attackrating = {};
		}
		if (!data.attackrating.physical )  data.attackrating.physical = { mod: 0};
		if (!data.attackrating.astral   )  data.attackrating.astral   = { mod: 0};
		if (!data.attackrating.vehicle  )  data.attackrating.vehicle  = { mod: 0};
		if (!data.attackrating.matrix   )  data.attackrating.matrix   = { mod: 0};
		if (!data.attackrating.social   )  data.attackrating.social   = { mod: 0};

		/* Physical Attack Rating - used for unarmed combat */
		data.attackrating.physical.base = data.attributes["rea"].pool + data.attributes["str"].pool;
		data.attackrating.physical.modString  = game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool+"\n";
		data.attackrating.physical.modString += game.i18n.localize("attrib.str_short") + " " + data.attributes["str"].pool;
		data.attackrating.physical.pool = data.attackrating.physical.base + data.attackrating.physical.mod;
		if (data.attackrating.physical.mod) {
			data.attackrating.physical.pool += data.attackrating.physical.mod;
			data.attackrating.physical.modString += "\n+" + data.attackrating.physical.mod;
		} 

		// Mana Attack Rating - used for unarmed astral combat or spells
		if (!data.tradition) {
			data.tradition = { attribute: "log"};
		}
		
		let traditionAttr = data.attributes[data.tradition.attribute];
		data.attackrating.astral.base = data.attributes["mag"].pool + traditionAttr.pool;
		data.attackrating.astral.modString  = game.i18n.localize("attrib.mag_short") + " " + data.attributes["mag"].pool+"\n";
		data.attackrating.astral.modString += game.i18n.localize("attrib."+data.tradition.attribute+"_short") + " " + data.attributes[data.tradition.attribute].pool;
		data.attackrating.astral.pool = data.attackrating.astral.base
		if (data.attackrating.astral.mod) {
			data.attackrating.astral.pool += data.attackrating.astral.mod;
			data.attackrating.astral.modString += "\n+" + data.attackrating.astral.mod;
		} 
		
		// Matrix attack rating (Angriff + Schleicher)
		data.attackrating.matrix.base = 0; //data.attributes["rea"].pool + data.attributes["str"].pool;
		data.attackrating.matrix.pool = data.attackrating.matrix.base;
		if (data.attackrating.matrix.mod) {
			data.attackrating.matrix.pool += data.attackrating.matrix.mod;
			data.attackrating.matrix.modString += "\n+" + data.attackrating.matrix.mod;
		} 
		
		// Vehicle combat attack rating (Pilot + Sensor)
		data.attackrating.vehicle.base = 0; //data.attributes["rea"].pool + data.attributes["str"].pool;
		data.attackrating.vehicle.pool = data.attackrating.vehicle.base;
		if (data.attackrating.vehicle.mod) {
			data.attackrating.vehicle.pool += data.attackrating.vehicle.mod;
			data.attackrating.vehicle.modString += "\n+" + data.attackrating.vehicle.mod;
		} 
		
		// Social value
		data.attackrating.social.base = data.attributes["cha"].pool;
		data.attackrating.social.modString = game.i18n.localize("attrib.cha_short") + " " + data.attributes["cha"].pool;
		data.attackrating.social.pool = data.attackrating.social.base;
		if (data.attackrating.social.mod) {
			data.attackrating.social.pool += data.attackrating.social.mod;
			data.attackrating.social.modString += "\n+" + data.attackrating.social.mod;
		} 
		items.forEach(function (item, key) {
			if (item.type == "gear" && item.data.data.type == "ARMOR") {
				if (item.data.data.usedForPool) {
					data.attackrating.social.pool += item.data.data.social;
					data.attackrating.social.modString += "\n+" + item.data.data.social + " " + item.name;
				}
			}
		});
	}

	//---------------------------------------------------------
	/*
	 * Calculate the attributes like Initiative
	 */
	_prepareDefenseRatings() {
		const actorData = this.data;
		const data = this.data.data;
		const items = this.data.items;

		// Store volatile

		if (actorData.type === "Player" || actorData.type === "NPC") {
			if (!data.defenserating) {
				data.defenserating = {};
			}
			if (!data.defenserating.physical)  data.defenserating.physical = { mod: 0};
			if (!data.defenserating.astral  )  data.defenserating.astral   = { mod: 0};
			if (!data.defenserating.vehicle )  data.defenserating.vehicle  = { mod: 0};
			if (!data.defenserating.matrix  )  data.defenserating.matrix   = { mod: 0};
			if (!data.defenserating.social  )  data.defenserating.social   = { mod: 0};
			
			
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
			data.defenserating.astral.pool = data.defenserating.astral.base;
			if (data.defenserating.astral.mod) {
				data.defenserating.astral.pool += data.defenserating.astral.mod;
				data.defenserating.astral.modString += "\n+" + data.defenserating.astral.mod;
			} 
			
			// Vehicles Defense Rating (Pilot + Armor)
			data.defenserating.vehicle.base = data.skills["piloting"].pool;
			data.defenserating.vehicle.modString  = game.i18n.localize("skill.piloting") + " " + data.skills["piloting"].pool;
			//data.defenserating.vehicle.modString += "\n"+game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defenserating.vehicle.pool = data.defenserating.vehicle.base;
			if (data.defenserating.vehicle.mod) {
				data.defenserating.vehicle.pool += data.defenserating.vehicle.mod;
				data.defenserating.vehicle.modString += "\n+" + data.defenserating.vehicle.mod;
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
	_prepareDefensePools() {
		const actorData = this.data;
		const data = this.data.data;

		// Store volatile

			if (!data.defensepool) {
				data.defensepool = {};
			}
			if (!data.defensepool.physical       )  data.defensepool.physical = {};
			if (!data.defensepool.astral         )  data.defensepool.astral = {};
			if (!data.defensepool.spells_direct  )  data.defensepool.spells_direct = {};
			if (!data.defensepool.spells_indirect)  data.defensepool.spells_indirect = {};
			if (!data.defensepool.spells_other   )  data.defensepool.spells_other = {};
			if (!data.defensepool.toxin          )  data.defensepool.toxin = {};
			if (!data.defensepool.damage_physical)  data.defensepool.damage_physical = {};
			if (!data.defensepool.damage_astral  )  data.defensepool.damage_astral = {};
			if (!data.defensepool.vehicle        )  data.defensepool.vehicle = {};
			
			// Physical Defense Test
			data.defensepool.physical.base = data.attributes["rea"].pool+ data.attributes["int"].pool;
 			data.defensepool.physical.modString = "\n"+game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
 			data.defensepool.physical.modString += "\n"+game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defensepool.physical.pool = data.defensepool.physical.base;
			if (data.defensepool.physical.mod) {
				data.defensepool.physical.pool += data.defensepool.physical.mod;
				data.defensepool.physical.modString += "\n+" + data.defensepool.physical.mod;
			} 
			
			// Astral(Combat) Defense Test
			data.defensepool.astral.base = data.attributes["log"].pool+ data.attributes["int"].pool;
 			data.defensepool.astral.modString = "\n"+game.i18n.localize("attrib.log_short") + " " + data.attributes["log"].pool;
 			data.defensepool.astral.modString += "\n"+game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defensepool.astral.pool = data.defensepool.astral.base;
			if (data.defensepool.astral.mod) {
				data.defensepool.astral.pool += data.defensepool.astral.mod;
				data.defensepool.astral.modString += "\n+" + data.defensepool.astral.mod;
			} 
			
			// Direct combat spell defense test
			data.defensepool.spells_direct.base = data.attributes["wil"].pool+ data.attributes["int"].pool;
 			data.defensepool.spells_direct.modString = "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
 			data.defensepool.spells_direct.modString += "\n"+game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defensepool.spells_direct.pool = data.defensepool.spells_direct.base;
			if (data.defensepool.spells_direct.mod) {
				data.defensepool.spells_direct.pool += data.defensepool.spells_direct.mod;
				data.defensepool.spells_direct.modString += "\n+" + data.defensepool.spells_direct.mod;
			} 
			
			// Indirect combat spell defense test
			data.defensepool.spells_indirect.base = data.attributes["rea"].pool+ data.attributes["wil"].pool;
 			data.defensepool.spells_indirect.modString = "\n"+game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
 			data.defensepool.spells_indirect.modString += "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.spells_indirect.pool = data.defensepool.spells_indirect.base;
			if (data.defensepool.spells_indirect.mod) {
				data.defensepool.spells_indirect.pool += data.defensepool.spells_indirect.mod;
				data.defensepool.spells_indirect.modString += "\n+" + data.defensepool.spells_indirect.mod;
			} 
			
			// Other spell defense test
			data.defensepool.spells_other.base = data.attributes["log"].pool+ data.attributes["wil"].pool;
 			data.defensepool.spells_other.modString = "\n"+game.i18n.localize("attrib.log_short") + " " + data.attributes["log"].pool;
 			data.defensepool.spells_other.modString += "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.spells_other.pool = data.defensepool.spells_other.base;
			if (data.defensepool.spells_other.mod) {
				data.defensepool.spells_other.pool += data.defensepool.spells_other.mod;
				data.defensepool.spells_other.modString += "\n+" + data.defensepool.spells_other.mod;
			} 
			
			// Vehicle combat defense
			data.defensepool.vehicle.base = data.skills["piloting"].pool+ data.attributes["rea"].pool;
 			data.defensepool.vehicle.modString = "\n"+game.i18n.localize("skill.piloting") + " " + data.skills["piloting"].pool;
 			data.defensepool.vehicle.modString += "\n"+game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
			data.defensepool.vehicle.pool = data.defensepool.vehicle.base;
			if (data.defensepool.vehicle.mod) {
				data.defensepool.vehicle.pool += data.defensepool.vehicle.mod;
				data.defensepool.vehicle.modString += "\n+" + data.defensepool.vehicle.mod;
			} 
			
			// Resist toxin
			data.defensepool.toxin.base = data.attributes["bod"].pool+ data.attributes["wil"].pool;
 			data.defensepool.toxin.modString = "\n"+game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
 			data.defensepool.toxin.modString += "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.toxin.pool = data.defensepool.toxin.base;
			if (data.defensepool.toxin.mod) {
				data.defensepool.toxin.pool += data.defensepool.toxin.mod;
				data.defensepool.toxin.modString += "\n+" + data.defensepool.toxin.mod;
			} 
			
			// Resist physical damage
			data.defensepool.damage_physical.base = data.attributes["bod"].pool;
 			data.defensepool.damage_physical.modString = "\n"+game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
			data.defensepool.damage_physical.pool = data.defensepool.damage_physical.base;
			if (data.defensepool.damage_physical.mod) {
				data.defensepool.damage_physical.pool += data.defensepool.damage_physical.mod;
				data.defensepool.damage_physical.modString += "\n+" + data.defensepool.damage_physical.mod;
			} 
			
			// Resist astral damage
			data.defensepool.damage_astral.base = data.attributes["wil"].pool;
 			data.defensepool.damage_astral.modString = "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.damage_astral.pool = data.defensepool.damage_astral.base;
			if (data.defensepool.damage_astral.mod) {
				data.defensepool.damage_astral.pool += data.defensepool.damage_astral.mod;
				data.defensepool.damage_astral.modString += "\n+" + data.defensepool.damage_astral.mod;
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
	 * Convert skill, optional skill specialization and optional threshold 
	 * into a roll name for display
	 * @param {string} skillId      The skill id (e.g. "con")
	 * @param {string} spec         The skill specialization
	 * @param {int}    threshold    Optional threshold
	 * @return Roll name
	 */
	_getSkillCheckText(skillId, spec, threshold) {
		const skl = this.data.data.skills[skillId];
		// Build test name
		let rollName = game.i18n.localize("skill." + skillId);
		if (spec) {
			rollName += "/"+game.i18n.localize("shadowrun6.special." + skillId+"."+spec);
		}
		rollName += " + ";
		// Attribute
		let attrName = game.i18n.localize("attrib."+CONFIG.SR6.ATTRIB_BY_SKILL.get(skillId).attrib);
		rollName += attrName;
		
		if (threshold) {
			rollName += " ("+threshold+")";
		}

		return rollName;		
	}

	//---------------------------------------------------------
	/**
	 * Calculate the skill pool
	 * @param {string} skillId      The skill id (e.g. "con")
	 * @param {string} spec         Optional: The skill specialization
	 * @return Roll name
	 */
	_getSkillPool(skillId, spec) {
		const skl = this.data.data.skills[skillId];
		// Calculate pool
		let value = skl.pool;
		if (spec) {
			if (spec==skl.expertise) {
				value=skl.poolE;
			} else if (spec==skl.specialization) {
				value=skl.poolS;
			}
		}
		return value;		
	}

	//---------------------------------------------------------
	/**
	 * Return a translated spell name
	 * @param {Object} spell      The spell to cast
	 * @return Roll name
	 */
	_getSpellName(spell) {
		if (spell.genesisId) {
			const key = "shadowrun6.compendium.spell." + spell.genesisId;
			let name = game.i18n.localize(key);
			if (key!=name)
				return name;
		}
		
		return spell.name;
	}

	//---------------------------------------------------------
	/**
	 * Return a translated gear name
	 * @param {Object} item   The gear to use
	 * @return Display name
	 */
	_getGearName(item) {
		if (item.genesisId) {
			const key = "shadowrun6.compendium.gear." + item.genesisId;
			let name = game.i18n.localize(key);
			if (key!=name)
				return name;
		}
		
		return item.name;
	}

	//---------------------------------------------------------
	/**
	 * @param {Function} func   function to return value from actor
	 * @return Value
	 */
	_getHighestDefenseRating(map) {
		let highest = 0;
		for (var it = game.user.targets.values(), val= null; val=it.next().value; ) {
			let actor   = val.actor;
			let here    = map(actor);
			if (here>highest)
				highest = here;
      }
		return highest;
	}

	//---------------------------------------------------------
	/**
	 * Roll a simple skill test
	 * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
	 * @param {string} skillId      The skill id (e.g. "con")
	 * @param {string} spec         The skill specialization
	 * @param {int}    threshold    Optional threshold
	 * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
	 */
	rollSkill(skillId, spec, threshold=3, options={}) {
		console.log("rollSkill("+skillId+", threshold=",threshold);
		const skl = this.data.data.skills[skillId];
		// Prepare action text
		let actionText;
		// Prepare check text
		let checkText = this._getSkillCheckText(skillId,spec,threshold);
		// Calculate pool
		let value = this._getSkillPool(skillId, spec);

		// Roll and return
		let data = mergeObject(options, {
			pool: value,
			actionText: actionText,
			checkText  : checkText,
			skill: skl,
			spec: spec,
			threshold: threshold,
			isOpposed: false,
			rollType: "skill",
			isAllowDefense: false,
			useThreshold: true,
			buyHits: true
		});
		data.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(data);
	}

	//-------------------------------------------------------------
	/*
	 *
	 */
	rollItem(itemId, options = {}) {
		console.log("rollItem(item="+itemId+", options="+options+")");
		const item = this.items.get(itemId);
		const skillId = item.data.data.skill;
		const spec = item.data.data.skillSpec;
		const skl = this.data.data.skills[skillId];
		// Prepare action text
		let actionText;
		switch (game.user.targets.size) {
		case 0:
			actionText = game.i18n.format("shadowrun6.roll.actionText.attack_target_none", {name:this._getGearName(item)});
			break;
		case 1:
		   let targetName = game.user.targets.values().next().value.name;
			actionText = game.i18n.format("shadowrun6.roll.actionText.attack_target_one", {name:this._getGearName(item), target:targetName});
			break;
		default:
			actionText = game.i18n.format("shadowrun6.roll.actionText.attack_target_multiple", {name:this._getGearName(item)});
		}
		// Prepare check text
		let checkText = this._getSkillCheckText(skillId,spec,0);
		// Get pool
		let pool = item.data.data.pool;

		let highestDefenseRating = this._getHighestDefenseRating( (a) => { a.data.data.defenserating.physical.pool});

		let data = mergeObject(options, {
			pool: pool,
			actionText: actionText,
			checkText  : checkText,
			rollType: "weapon",
			skill: this.data.data.skills[skillId],
			spec: spec,
			item: item,
			defRating : highestDefenseRating,
			targets: game.user.targets.forEach( val => val.actor),
			isOpposed: true,
			isAllowDefense: true,
			defendWith: "physical",
			hasDamageResist: true,
			useWildDie: item.data.data.wild,
			buyHits: false
		});
		data.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(data);
	}

	//-------------------------------------------------------------
	/**
	 * Roll a spell test. Some spells are opposed, some are simple tests.
	 * @param {string} itemId       The item id of the spell
	 * @param {boolean} ritual      TRUE if ritual spellcasting is used
	 * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
	 */
	rollSpell(itemId, ritual=false, options={}) {
		console.log("rollSpell("+itemId+")");
		const skillId = "sorcery";
		const spec    = (ritual)?"spellcasting":"ritual_spellcasting";
		const item = this.items.get(itemId);
		// Prepare action text
		let actionText = game.i18n.format("shadowrun6.roll.actionText.cast", {name:this._getSpellName(item)});
		// Get pool
		let pool = this._getSkillPool(skillId, spec);
		let rollName = this._getSkillCheckText(skillId, spec);		

		// Determine whether or not the spell is an opposed test
		// and what defense eventually applies
		let isOpposed = false;
		let hasDamageResist = true;
		let attackRating = this.data.data.attackrating.astral.pool;
		let highestDefenseRating = this._getHighestDefenseRating( (a) => { a.data.data.defenserating.physical.pool});
		let threshold = 0;
		let canAmpUpSpell = item.data.data.category === "combat";
		let canIncreaseArea = item.data.data.range==="line_of_sight_area" || item.data.data.range==="self_area";
		if (item.data.data.category === "combat") {
			isOpposed = true;
			if (item.data.data.type=="mana") {
				hasDamageResist = false;
			}
		} else if (item.data.data.category === "manipulation") {
			isOpposed = true;
		} else if (item.data.data.category === "heal") {
			if (item.data.data.withEssence) {
				threshold = 5 - Math.ceil(this.data.data.essence);
			}
		}
		
		// If present, replace spell name, description and source references from compendium
		let spellName = item.name;
		let spellDesc = "";
		let spellSrc  = "";
		if (item.data.data.description) {
			spellDesc = item.data.data.description;
		}
		if (item.data.data.genesisID) {
			let key = "spell."+item.data.data.genesisID+".";
			if (!game.i18n.localize(key+"name").startsWith(key)) {
				// A translation exists
				spellName = game.i18n.localize(key+"name");
				spellDesc = game.i18n.localize(key+"desc");
				spellSrc = game.i18n.localize(key+"src");
			}
		}

		let data = mergeObject(options, {
			isSpell : true,
			pool: pool,
			actionText: actionText,
			checkText  : rollName,
			skill: this.data.data.skills[skillId],
			spec: spec,
			spell: item,
			spellName: spellName,
			spellDesc: spellDesc,
			spellSrc : spellSrc,
			canModifySpell: canAmpUpSpell || canIncreaseArea,
			canAmpUpSpell : canAmpUpSpell,
			canIncreaseArea : canIncreaseArea,
			attackRating: attackRating,
			defRating : highestDefenseRating,
			targets: game.user.targets.forEach( val => val.actor),
			isOpposed: isOpposed,
			rollType: "spell",
			isAllowDefense: true,
			hasDamageResist: hasDamageResist,
			buyHits: !isOpposed
		});
		data.speaker = ChatMessage.getSpeaker({ actor: this });
		if (isOpposed) {
			return doRoll(data);
		} else {
			return doRoll(data);
		}
	}

	//-------------------------------------------------------------
	/**
	 * Roll a spell test. Some spells are opposed, some are simple tests.
	 * @param {string} itemId       The item id of the spell
	 * @param {boolean} ritual      TRUE if ritual spellcasting is used
	 * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
	 */
	rollDefense(itemId, options={}) {
		console.log("rollDefense("+itemId+")");
		const skillId = "sorcery";
		const spec    = (ritual)?"spellcasting":"ritual_spellcasting";
		const item = this.items.get(itemId);
		// Prepare action text
		let actionText = game.i18n.format("shadowrun6.roll.actionText.cast", {name:this._getSpellName(item)});
		// Get pool
		let pool = this._getSkillPool(skillId, spec);
		let rollName = "Defense";

		let data = mergeObject(options, {
			rollType: "defense",
			pool: pool,
			actionText: actionText,
			checkText  : rollName,
			isOpposed: false,
			hasDamageResist: false,
			buyHits: false
		});
		data.speaker = ChatMessage.getSpeaker({ actor: this });
		if (isOpposed) {
			return doRoll(data);
		} else {
			return doRoll(data);
		}
	}


	//-------------------------------------------------------------
	/*
	 *
	 */
	rollCommonCheck(pool, title, dialogConfig, options = {}) {
		console.log("rollCommonCheck(pool="+pool+")");
		let data = mergeObject(options, {
			pool: pool,
			checkText: title,
			dialogConfig: dialogConfig	
		});
		data.speaker = ChatMessage.getSpeaker({actor: this});
		return doRoll(data);
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
