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
		console.log("Shadowrun6Actor.prepareData() " + this.data.name+" = "+this.data.type);

		const data = this.data.data;
		
		if (!data.tradition) {
			data.tradition = {
				"name": "",
				"attribute": "log"
			};
		}

	try {
		if (this.data.type!="Vehicle" && this.data.type!="Critter") {
			this._prepareAttributes();
			this._prepareDerivedAttributes();
			this._preparePersona();
			this._prepareAttackRatings();
			this._prepareDefenseRatings();
			this._prepareSkills();
			this._prepareDefensePools();
			this._prepareItemPools();
			this._prepareVehiclePools();
			
			this._calculateEssence();
		
			if (data.mortype) {
				data.morDef = SR6.MOR_DEFINITIONS[data.mortype];
			}
		}
		if (this.data.type==='Critter') {
			this._prepareAttributes();
			this._prepareDerivedAttributes();
			this._prepareAttackRatings();
			this._prepareDefenseRatings();
			this._prepareSkills();
			this._prepareDefensePools();
			this._prepareItemPools();
		}
		if (this.data.type==='Vehicle') {
			this._prepareDerivedVehicleAttributes();
		}
		} catch (err) {
			console.log("Error "+err.stack);
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
		if (actorData.type === "Player" || actorData.type === "NPC"|| actorData.type === "Critter") {
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

		if (actorData.type === "Player" || actorData.type === "NPC" || actorData.type === "Critter") {
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

            if (data.overflow) {
                data.overflow.base = data.attributes["bod"].pool * 2;
                data.overflow.max = data.attributes["bod"].pool * 2;
                data.overflow.value = data.overflow.dmg;
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

	  if (!data.derived)
			return;

            // Physical Heal Pool
            data.derived.heal_pool = {
                physical: data.attributes["bod"].pool * 2,
                stun: data.attributes["bod"].pool + data.attributes["wil"].pool
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
			// Matrix perception
			if (!data.derived.matrix_perception) {
				data.derived.matrix_perception={};
			}
			data.derived.matrix_perception.base = data.skills["electronics"].points + data.skills["electronics"].modifier + data.attributes["int"].pool;
			data.derived.matrix_perception.pool = data.derived.matrix_perception.base + data.derived.matrix_perception.mod;
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
		if (!data.attackrating.resonance)  data.attackrating.resonance= { mod: 0};

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
		if (data.persona && data.persona.used) {
			data.attackrating.matrix.base = data.persona.used.a + data.persona.used.s;
			data.attackrating.matrix.pool = data.attackrating.matrix.base;
			if (data.attackrating.matrix.mod) {
				data.attackrating.matrix.pool += data.attackrating.matrix.mod;
				data.attackrating.matrix.modString += "\n+" + data.attackrating.matrix.mod;
			} 
		
		// Resonance attack rating (Electronics + Resonance)
		data.attackrating.resonance.base = data.persona.used.a + data.attributes["res"].pool;
		data.attackrating.resonance.modString  = game.i18n.localize("skill.electronics") + " + ";
		data.attackrating.resonance.modString += game.i18n.localize("attrib.res_short");
		data.attackrating.resonance.pool = data.attackrating.resonance.base;
		if (data.attackrating.resonance.mod) {
			data.attackrating.resonance.pool += data.attackrating.resonance.mod;
			data.attackrating.resonance.modString += "\n+" + data.attackrating.resonance.mod;
		}
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
			
			// Matrix defense
			data.defenserating.matrix.base = data.persona.used.d + data.persona.used.f;
			data.defenserating.matrix.modString = ""; //game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defenserating.matrix.pool = data.defenserating.matrix.base;
			if (data.defenserating.matrix.mod) {
				data.defenserating.matrix.pool += data.defenserating.matrix.mod;
				data.defenserating.matrix.modString += "\n+" + data.defenserating.matrix.mod;
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
				if (data.skills[id].points==0) {
					data.skills[id].pool--;
				}
				
				
				data.skills[id].poolS = attribVal + data.skills[id].points;
				data.skills[id].poolE = attribVal + data.skills[id].points;
				if (data.skills[id].specialization)
					data.skills[id].poolS = data.skills[id].pool+2;
				if (data.skills[id].expertise)
					data.skills[id].poolE = data.skills[id].pool+3;
					
				if (data.skills[id].pool<0) { data.skills[id].pool=0;}
				if (data.skills[id].poolS<0) { data.skills[id].poolS=0;}
				if (data.skills[id].poolE<0) { data.skills[id].poolE=0;}
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
			if (!data.defensepool.drain          )  data.defensepool.drain = {};
			if (!data.defensepool.fading         )  data.defensepool.fading = {};
			
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
			
			// Resist drain
			let traditionAttr = data.attributes[data.tradition.attribute];
			data.defensepool.drain.base = traditionAttr.pool + data.attributes["wil"].pool;
 			data.defensepool.drain.modString = "\n"+game.i18n.localize("attrib."+data.tradition.attribute+"_short") + " " + traditionAttr.pool;
 			data.defensepool.drain.modString += "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.drain.pool = data.defensepool.drain.base;
			if (data.defensepool.drain.mod) {
				data.defensepool.drain.pool += data.defensepool.drain.mod;
				data.defensepool.drain.modString += "\n+" + data.defensepool.drain.mod;
			} 
			
			// Resist fading
			data.defensepool.fading.base = data.attributes["wil"].pool + data.attributes["log"].pool;
 			data.defensepool.fading.modString = "\n"+game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
 			data.defensepool.fading.modString += "\n"+game.i18n.localize("attrib.log_short") + " " + data.attributes["log"].pool;
			data.defensepool.fading.pool = data.defensepool.fading.base;
			if (data.defensepool.fading.mod) {
				data.defensepool.fading.pool += data.defensepool.fading.mod;
				data.defensepool.fading.modString += "\n+" + data.defensepool.fading.mod;
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
				//item.data.pool = tmpItem.actor.data.data.skills[item.data.skill].pool;
				item.data.pool = this._getSkillPool(item.data.skill, item.data.skillSpec, tmpItem.actor.data.data.skills[item.data.skill].attrib);
				item.data.pool = item.data.pool + eval(item.data.modifier);
			};
			if (tmpItem.type == "gear" && item.data.dmg>0) {
				if (item.data.stun) {
					if (item.data.stun==='false') {item.data.stun = false;}
					else if (item.data.stun==='true') { item.data.stun = true;}
				}
				let suffix = item.data.stun?game.i18n.localize("shadowrun6.item.stun_damage"):game.i18n.localize("shadowrun6.item.physical_damage");
				item.data.dmgDef = item.data.dmg+suffix;
			}
			
			if (tmpItem.type == "complexform" && item.data.genesisID) {
				if (!item.data.skill) {
					let cform = CONFIG.SR6.COMPLEX_FORMS[item.data.genesisID];
					if (cform && cform.skill) {
						item.data.skill = cform.skill;
						item.data.oppAttr1 = cform.opposedAttr1;
						item.data.oppAttr2 = cform.opposedAttr2;
						item.data.threshold = cform.threshold;
					}
				}
			}
		});
	}
	
	//---------------------------------------------------------
	/*
	 * Calculate the pool when using items with assigned skills
	 */
	_prepareVehiclePools() {
		const actorData = this.data;

		if (!actorData.data.controlRig) {
			actorData.data.controlRig=0;
		}

		actorData.items.forEach(tmpItem => {
			let item = tmpItem.data;
			// Any kind of gear
			if (item.type == "gear" && (item.data.type==="VEHICLES" || item.data.type==="DRONES")) {
				if (!item.data.vehicle) { 
					item.data.vehicle = {
						attrib: "rea",
						opMode: "manual",
						ar    : {},
						dr    : {},
						handling: {},
						spec  : ""
					};
				};
				if (!item.data.vehicle.attrib)  item.data.vehicle.attrib="rea";
				if (!item.data.vehicle.ar)  item.data.vehicle.ar={};
				if (!item.data.vehicle.dr)  item.data.vehicle.dr={};
				if (!item.data.vehicle.handling)  item.data.vehicle.handling={};
				
				let specialization = item.data.vtype;
				if ("GROUND" === specialization) { specialization = "ground_craft"; }
				if ("WATER"  === specialization) { specialization = "watercraft"; }
				if ("AIR"    === specialization) { specialization = "aircraft"; }
				
				let vehicle = item.data.vehicle;
				item.data.vehicle.spec = specialization;
				let opMode = vehicle.opMode;
				let rigRating = parseInt(actorData.data.controlRig); 
				let modRig = "";
				if (rigRating>0) {
					modRig = " + "+game.i18n.localize("shadowrun6.item.vehicle.rigRating.long")+" ("+rigRating+")";
				}
				switch (opMode) {
				case "manual":
					rigRating = 0; 
					modRig = "";
				case "riggedAR":
					vehicle.ar.pool = actorData.data.skills.piloting.points + item.data.sen + rigRating;
					vehicle.ar.modString = 
						game.i18n.localize("skill.piloting")+"("+actorData.data.skills.piloting.points+") +"+ 
						game.i18n.localize("shadowrun6.item.vehicle.sensor.long")+" ("+item.data.sen+")"+
						modRig;
					vehicle.dr.pool = actorData.data.skills.piloting.points + item.data.arm + rigRating;
					vehicle.dr.modString = 
						game.i18n.localize("skill.piloting")+"("+actorData.data.skills.piloting.points+") +"+ 
						game.i18n.localize("shadowrun6.item.vehicle.armor.long")+" ("+item.data.arm+")"+
						modRig;
					vehicle.handling.pool = this._getSkillPool("piloting",specialization,"rea") + rigRating;
					vehicle.handling.modString = 
						game.i18n.localize("skill.piloting")+"("+actorData.data.skills.piloting.points+") +"+ 
						game.i18n.localize("attrib.rea_short")+"("+actorData.data.attributes.rea.pool+")"+
						modRig;
					break;
				case "riggedVR":
					item.data.vehicle.attrib="int";
					vehicle.ar.pool = actorData.data.skills.piloting.points + item.data.sen + rigRating;
					vehicle.ar.modString = 
						game.i18n.localize("skill.piloting")+"("+actorData.data.skills.piloting.points+") +"+ 
						game.i18n.localize("shadowrun6.item.vehicle.sensor.long")+" ("+item.data.sen+")"+
						modRig;
					vehicle.dr.pool = actorData.data.skills.piloting.points + item.data.arm + rigRating;
					vehicle.dr.modString = 
						game.i18n.localize("skill.piloting")+"("+actorData.data.skills.piloting.points+") +"+ 
						game.i18n.localize("shadowrun6.item.vehicle.armor.long")+" ("+item.data.arm+")"+
						modRig;
					vehicle.handling.pool = this._getSkillPool("piloting",specialization,"int")+ rigRating;
					vehicle.handling.modString = 
						game.i18n.localize("skill.piloting")+"("+actorData.data.skills.piloting.points+") +"+ 
						game.i18n.localize("attrib.int_short")+"("+actorData.data.attributes.int.pool+")"+
						modRig;
					break;
				default:
				}
			}
		});
	}

	//---------------------------------------------------------
	/*
	 * Calculate the attributes like Initiative
	 */
	_prepareDerivedVehicleAttributes() {
		const actorData = this.data;
		const data = this.data.data;

		// Monitors
			if (data.physical) {
				if (!data.physical.mod) data.physical.mod=0;
				
				data.physical.base = 8 + Math.round(data.bod / 2);
				data.physical.max = data.physical.base + data.physical.mod;
				data.physical.value = data.physical.max - data.physical.dmg;
			}
			// Use "stun" as matrix condition
			if (data.stun) {
				if (!data.stun.mod) data.stun.mod=0;
				// 8 + (Device Rating / 2) where Dev.Rat. is Sensor
				data.stun.base = 8 + Math.round(data.sen / 2);
				data.stun.max = data.stun.base + data.stun.mod;
				data.stun.value = data.stun.max - data.stun.dmg;
			}
		
		// Test modifier depending on speed
		let interval = data.vehicle.offRoad?data.spdiOff:data.spdiOn;
		if (interval<=1) interval=1;
		let modifier = Math.floor(data.vehicle.speed / interval);
		// Modify with physical monitor
		modifier += Math.floor(data.physical.dmg / 3);		
		data.vehicle.modifier = modifier;
		data.vehicle.kmh = data.vehicle.speed *1.2;
	}
	
	//---------------------------------------------------------
	/*
	 * 
	 */
	_preparePersona() {
		const actorData = this.data.data;

		if (!actorData.persona            ) actorData.persona = {};
		if (!actorData.persona.device     ) actorData.persona.device = {};
		if (!actorData.persona.device.base) actorData.persona.device.base = { "a":0, "s":0, "d":0, "f":0};
		if (!actorData.persona.device.mod ) actorData.persona.device.mod  = { "a":0, "s":0, "d":0, "f":0};
		if (!actorData.persona.device.monitor) actorData.persona.device.monitor = {};
		delete actorData.persona.device.monitor.max;
		
		this.data.items.forEach(tmpItem => {
			let item = tmpItem.data.data;
			if (tmpItem.type == "gear" && item.type=="ELECTRONICS") {
				if (item.subtype == "COMMLINK" || item.subtype == "CYBERJACK" || item.subtype == "RIGGER_CONSOLE") {
					if (item.usedForPool) {
						actorData.persona.device.base.d = item.d;
						actorData.persona.device.base.f = item.f;
						if (! actorData.persona.device.monitor.max) {
							actorData.persona.device.monitor.max = ((item.subtype == "COMMLINK")?item.devRating:item.rating)/2 +8;							
						}
					}
				};
				if (item.subtype == "CYBERDECK") {
					if (item.usedForPool) {
						actorData.persona.device.base.a = item.a;
						actorData.persona.device.base.s = item.s;
						actorData.persona.device.monitor.max =item.devRating/2 +8;		
					}
				};
			}			
		});
		
		if (!actorData.persona.used     ) actorData.persona.used = {};
		actorData.persona.used.a = actorData.persona.device.mod.a;
		actorData.persona.used.s = actorData.persona.device.mod.s;
		actorData.persona.used.d = actorData.persona.device.mod.d;
		actorData.persona.used.f = actorData.persona.device.mod.f;
		
		
		// Living persona
		if (actorData.mortype=="technomancer") {
			if (!actorData.persona.living     ) actorData.persona.living = {};
			if (!actorData.persona.living.base) actorData.persona.living.base = {};
			if (!actorData.persona.living.mod ) actorData.persona.living.mod  = {};
			actorData.persona.living.base.a = actorData.attributes["cha"].pool;
			actorData.persona.living.base.s = actorData.attributes["int"].pool;
			actorData.persona.living.base.d = actorData.attributes["log"].pool;
			actorData.persona.living.base.f = actorData.attributes["wil"].pool;
			actorData.persona.living.devRating = actorData.attributes["res"].pool;
			// Initiative: Data processing + Intuition
			actorData.persona.initative = {};
			actorData.persona.initative.base = actorData.persona.living.base.d + actorData.attributes["int"].pool

			actorData.persona.used.a = actorData.persona.living.base.a + actorData.persona.living.mod.a;
			actorData.persona.used.s = actorData.persona.living.base.s + actorData.persona.living.mod.s;
			actorData.persona.used.d = actorData.persona.living.base.d + actorData.persona.living.mod.d;
			actorData.persona.used.f = actorData.persona.living.base.f + actorData.persona.living.mod.f;
		}
		
		if (actorData.skills) {
			// Attack pool
			actorData.persona.attackPool = actorData.skills["cracking"].points + actorData.skills["cracking"].modifier;
			if (actorData.skills.expertise=="cybercombat") { actorData.persona.attackPool+=3} else
			if (actorData.skills.specialization=="cybercombat") { actorData.persona.attackPool+=2} 
			actorData.persona.attackPool += actorData.attributes["log"].pool;
		}
			
		// Damage
		actorData.persona.damage = Math.ceil(actorData.persona.used.a/2);
	}

	//---------------------------------------------------------
	/*
	 * Calculate the attributes like Initiative
	 */
	_calculateEssence() {
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
	_getSkillCheckText(skillId, spec, threshold, attrib) {
		const skl = this.data.data.skills[skillId];
		// Build test name
		let rollName = game.i18n.localize("skill." + skillId);
		if (spec) {
			rollName += "/"+game.i18n.localize("shadowrun6.special." + skillId+"."+spec);
		}
		rollName += " + ";
		// Attribute
		let useAttrib = (attrib)?attrib:CONFIG.SR6.ATTRIB_BY_SKILL.get(skillId).attrib;
		let attrName = game.i18n.localize("attrib."+useAttrib);
		rollName += attrName;
		
        /* This is somewhat not correct atm. It always shows "(3)". TODO: Fix this
		if (threshold && threshold>0) {
			rollName += " ("+threshold+")";
		}
        */

		return rollName;		
	}

	//---------------------------------------------------------
	/**
	 * Calculate the skill pool
	 * @param {string} skillId      The skill id (e.g. "con")
	 * @param {string} spec         Optional: The skill specialization
	 * @return Roll name
	 */
	_getSkillPool(skillId, spec, attrib) {
		if (!skillId)
			throw "Skill ID may not be undefined";
		const skl = this.data.data.skills[skillId];
		if (!skillId) {
			throw "Unknown skill '"+skillId+"'";
		}
		let skillDef = CONFIG.SR6.ATTRIB_BY_SKILL.get(skillId);
		if (!attrib) {
			attrib = skillDef.attrib;
		}
			
		// Calculate pool
		let value = skl.points + skl.modifier;
		if (skl.points==0) {
				value=-1;
		}
		
		if (spec) {
			if (spec==skl.expertise) {
				value+=3;
			} else if (spec==skl.specialization) {
				value+=2;
			}
		}
		
		// Add attribute
		value += this.data.data.attributes[attrib].pool;
		return value;		
	}

	//---------------------------------------------------------
	/**
	 * Return a translated complex form name
	 * @param {Object} spell      The spell to cast
	 * @return Roll name
	 */
	_getComplexFormName(complex) {
		if (complex.genesisId) {
			const key = "shadowrun6.compendium.complexform." + complex.genesisId;
			let name = game.i18n.localize(key);
			if (key!=name)
				return name;
		}
		
		return complex.name;
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
		console.log("rollSkill("+skillId+", spec="+spec+", threshold=",threshold+", options=",options);
		const skl = this.data.data.skills[skillId];
		// Prepare action text
		let actionText;
		// Prepare check text
		let checkText = this._getSkillCheckText(skillId,spec,threshold);
		// Calculate pool
		let value = this._getSkillPool(skillId, spec);
		// Optional: different attribute
		if (options.attrib) {
			value = this._getSkillPool(skillId, spec, options.attrib);
			checkText = this._getSkillCheckText(skillId,spec,threshold, options.attrib);
		}

		// Roll and return
		let data = mergeObject(options, {
			pool: value,
			actionText: actionText,
			checkText  : checkText,
			attrib: options.attrib,
      skillId: skillId,
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
	        let targetName =  game.user.targets.values().next().value.name;
			actionText = game.i18n.format("shadowrun6.roll.actionText.attack_target_one", {name:this._getGearName(item), target:targetName});
			break;
		default:
			actionText = game.i18n.format("shadowrun6.roll.actionText.attack_target_multiple", {name:this._getGearName(item)});
		}
		// Prepare check text
		let checkText = this._getSkillCheckText(skillId,spec,0);
		// Get pool
		let pool = item.data.data.pool;

		let highestDefenseRating = this._getHighestDefenseRating( a =>  a.data.data.defenserating.physical.pool);
		console.log("Highest defense rating of targets: "+highestDefenseRating);
		
		// If present, replace spell name, description and source references from compendium
		let spellName = item.name;
		let spellDesc = "";
		let spellSrc  = "";
		if (item.data.data.description) {
			spellDesc = item.data.data.description;
		}
		if (item.data.data.genesisID) {
			let key = "item."+item.data.data.genesisID+".";
			if (!game.i18n.localize(key+"name").startsWith(key)) {
				// A translation exists
				spellName = game.i18n.localize(key+"name");
				spellDesc = game.i18n.localize(key+"desc");
				spellSrc = game.i18n.localize(key+"src");
			}
		}

		let data = mergeObject(options, {
			pool: pool,
			actionText: actionText,
			checkText  : checkText,
			rollType: "weapon",
			skill: this.data.data.skills[skillId],
			spec: spec,
			item: item,
			itemName: spellName,
			itemDesc: spellDesc,
			itemSrc : spellSrc,
			defRating : highestDefenseRating,
			targets: game.user.targets,
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
		console.log("rollSpell("+itemId+", ritual="+ritual+")");
		const skillId = "sorcery";
		const spec    = (ritual)?"ritual_spellcasting":"spellcasting";
		const item = this.items.get(itemId);
		let threshold = ritual? (item.data.data.threshold):0;
		// Prepare action text
		let actionText;
		switch (game.user.targets.size) {
		case 0:
			actionText = actionText = game.i18n.format("shadowrun6.roll.actionText.cast", {name:this._getSpellName(item)});
			break;
		case 1:
		   let targetName = game.user.targets.values().next().value.name;
			actionText = game.i18n.format("shadowrun6.roll.actionText.cast_target_one", {name:this._getGearName(item), target:targetName});
			break;
		default:
			actionText = game.i18n.format("shadowrun6.roll.actionText.cast_target_multiple", {name:this._getGearName(item)});
		}
		// Prepare check text
		let checkText = this._getSkillCheckText(skillId,spec,0);
		// Get pool
		let pool = this._getSkillPool(skillId, spec);
		let rollName = this._getSkillCheckText(skillId, spec, threshold);		

		// Determine whether or not the spell is an opposed test
		// and what defense eventually applies
		let isOpposed = false;
		let hasDamageResist = !ritual;
		let defendWith = "physical";
		let attackRating = this.data.data.attackrating.astral.pool;
		let highestDefenseRating = this._getHighestDefenseRating( a =>  a.data.data.defenserating.physical.pool);
		console.log("Highest defense rating of targets: "+highestDefenseRating);
		let canAmpUpSpell = item.data.data.category === "combat";
		let canIncreaseArea = item.data.data.range==="line_of_sight_area" || item.data.data.range==="self_area";
		if (item.data.data.category === "combat") {
			isOpposed = true;
			if (item.data.data.type=="mana") {
				defendWith = "spells_direct";
				hasDamageResist = false;
			} else {
				defendWith = "spells_indirect";
			}
		} else if (item.data.data.category === "manipulation") {
			isOpposed = true;
				defendWith = "spells_other";
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
			let key = (ritual?"ritual.":"spell.")+item.data.data.genesisID+".";
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
			targets: game.user.targets,
			isOpposed: isOpposed,
			threshold: threshold,
			rollType: ritual?"ritual":"spell",
			isAllowDefense: true,
			defendWith: defendWith,
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

	//---------------------------------------------------------
	/**
	 */
	performMatrixAction(action, actionId, options={}) {
		console.log("performMatrixAction("+action+")");
		// Prepare action text
		let actionText = game.i18n.localize("shadowrun6.matrixaction."+actionId);
		// Prepare check text
		if (!action.skill) {
			console.log("ToDo: matrix actions without a test");
			return;
		}
		let checkText = this._getSkillCheckText(action.skill,action.spec,action.threshold,action.attrib);
		// Calculate pool
		let value = this._getSkillPool(action.skill, action.spec, action.attrib);

		// Roll and return
		let data = mergeObject(options, {
			pool: value,
			actionText: actionText,
			checkText  : checkText,
			attackRating : this.data.data.attackrating.matrix.pool,
			matrixAction: action,
			skill: action.skill,
			spec: action.spec,
			threshold: action.threshold,
			isOpposed: action.opposedAttr1!=null,
			rollType: "matrixaction",
			isAllowDefense: action.opposedAttr1!=null,
			useThreshold: action.threshold!=0,
			buyHits: true
		});
		data.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(data);
	}

	//-------------------------------------------------------------
	/**
	 * Roll a complex form test. Some complex forms are opposed, some are simple tests.
	 * @param {string} itemId       The item id of the spell
	 * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
	 */
	rollComplexForm(itemId, options={}) {
		console.log("rollComplexForm("+itemId+")");
		const complex = this.items.get(itemId);
		let skillId = complex.data.data.skill;
		if (!skillId)
			skillId = "electronics";
		const spec    = null;
		let threshold = complex.data.data.threshold;
		// Prepare action text
		let actionText = game.i18n.format("shadowrun6.roll.actionText.thread", {name:this._getComplexFormName(complex)});
		// Get pool
		let pool = this._getSkillPool(skillId, spec, "res");
		let rollName = this._getSkillCheckText(skillId, spec, threshold, "res");		

		// Determine whether or not the spell is an opposed test
		// and what defense eventually applies
		let isOpposed = (complex.data.data.oppAttr1!=undefined);
		let defendWith = "matrix";
		let attackRating = this.data.data.attackrating.resonance.pool;
		let highestDefenseRating = this._getHighestDefenseRating( a =>  a.data.data.defenserating.matrix.pool);
		console.log("Highest defense rating of targets: "+highestDefenseRating);
		
		// If present, replace spell name, description and source references from compendium
		let spellName = complex.name;
		let spellDesc = "";
		let spellSrc  = "";
		if (complex.data.data.description) {
			spellDesc = complex.data.data.description;
		}
		if (complex.data.data.genesisID) {
			let key = "complexform."+complex.data.data.genesisID+".";
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
			complexform: complex,
			spellName: spellName,
			spellDesc: spellDesc,
			spellSrc : spellSrc,
			attackRating: attackRating,
			defRating : highestDefenseRating,
			targets: game.user.targets.forEach( val => val.actor),
			isOpposed: isOpposed,
			threshold: threshold,
			rollType: "complexform",
			isAllowDefense: complex.oppAttr1!="",
			defendWith: defendWith,
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

    rollHealCheck(dataset, options = {}) {
        console.log("rollHealCheck(pool="+dataset.pool+", type="+dataset.itemId+")")
        console.log(this);
        let data = mergeObject(options, {
            pool: dataset.pool,
            title: game.i18n.localize("shadowrun6.derived."+dataset.itemId),
            actionText: game.i18n.localize("shadowrun6.derived."+dataset.itemId),
            healType: dataset.itemId,
            isHeal: true,
            target: this,
            rollType: "heal"
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

	applyDamage(dataset) {
        let type = dataset.damageType ?? dataset.healtype;
        const damage = dataset.damagetoapply ?? -dataset.healtoapply;

        switch (type) {
            case "S":
            case "heal.stun":
                type = "stun"; break;
            case "P":
            case "heal.physical":
                type = "physical"; break;
        }

        const token = TokenLayer.instance.objects.children.find((token) => token.data._id === dataset.targetid);
        const actor = token.document.actor;
        const damageObj = actor.data.data[type];

        let hp = damageObj.dmg + parseInt(damage);
        let overflow = Math.max(0, hp - damageObj.max);
        console.log(overflow)
        hp = Math.min(Math.max(0, hp), damageObj.max);
        
        token.document.actor.update({[`data.overflow.dmg`]: overflow});
        token.document.actor.update({[`data.`+type+`.dmg`]: hp });
	}
}
