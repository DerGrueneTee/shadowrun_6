import { Lifeform, ILifeform, Attribute, SR6Actor, Player, Derived, DefensePool, Pool, Ratings, Monitor, Skill, CurrentVehicle, VehicleActor, MatrixUser } from "./ActorTypes.js";
import { Defense, MonitorType, SR6, SR6Config } from "./config.js";
import { MatrixAction, SkillDefinition } from "./DefinitionTypes.js";
import { Armor, ComplexForm, Gear,MatrixDevice,Persona,Spell,Vehicle,Weapon } from "./ItemTypes.js";
//import { doRoll } from "./dice/CommonRoll.js";
import { doRoll } from "./Rolls.js";
import { WeaponRoll, SkillRoll, SpellRoll, PreparedRoll, MatrixActionRoll, RollType, DefenseRoll, SoakType, SoakRoll } from "./dice/RollTypes.js";
import { ActorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

function isLifeform(obj: any): obj is Lifeform {
    return obj.attributes != undefined;
}
function isMatrixUser(obj: any): obj is MatrixUser {
    return obj.persona != undefined;
}
function isGear(obj: any): obj is Gear {
    return obj.skill != undefined;
}
function isVehicle(obj: any): obj is Vehicle {
    return obj.skill != undefined && obj.vehicle!=undefined;
}
function isSpell(obj: any): obj is Spell {
    return obj.category != undefined;
}
function isWeapon(obj: any): obj is Weapon {
    return (obj.type==="WEAPON_FIREARMS" || obj.type==="WEAPON_CLOSE_COMBAT" || obj.type==="WEAPON_RANGED" || obj.type==="WEAPON_SPECIAL") && obj.dmg != undefined;
}
function isArmor(obj: any): obj is Armor {
    return obj.defense != undefined;
}
function isComplexForm(obj: any): obj is ComplexForm {
    return obj.fading != undefined;
}
function isMatrixDevice(obj: any): obj is MatrixDevice {
    return obj.d != undefined && obj.type=="ELECTRONICS";
}
declare global {
    interface CONFIG {
        SR6: SR6Config
    }
}

export class Shadowrun6Actor extends Actor {

    /** 
     * @Override 
     */
    prepareData() {
        super.prepareData();
        console.log("Shadowrun6Actor.prepareData() " + this.data.name + " = " + this.data.type);

        const data:SR6Actor = this.data.data as SR6Actor;

        try {
            this._prepareAttributes();
            this._prepareDerivedAttributes();
            if (this.data.type != "Vehicle" && this.data.type != "Critter") {
					this._preparePersona();
               this._prepareAttackRatings();
               this._prepareDefenseRatings();
               this._prepareSkills();
               this._prepareDefensePools();
               this._prepareItemPools();
               this._prepareVehiclePools();
               this._calculateEssence();
               if (isLifeform(data) && data.mortype) {
               	data.morDef = SR6.MOR_DEFINITIONS[data.mortype];
               }
             }
             if (this.data.type === 'Critter') {
					this._prepareAttackRatings();
               this._prepareDefenseRatings();
               this._prepareSkills();
               this._prepareDefensePools();
                //     this._prepareItemPools();
             }
             if (this.data.type === 'Vehicle') {
               this._prepareDerivedVehicleAttributes();
             }
        } catch (err) {
            console.log("Error " + err.stack);
        }
    }

    //---------------------------------------------------------
    /*
     * Calculate the final attribute values
     */
    _prepareAttributes() {
        const actorData = this.data;
        const data = this.data.data;
         // Only run on lifeforms
        if (isLifeform(data)) {
             SR6.ATTRIBUTES.forEach(attr => {
                data.attributes[attr].pool =
                    data.attributes[attr].base
                    + data.attributes[attr].mod;
            });
        }
    }

    //---------------------------------------------------------
    /*
     * Calculate the attributes like Initiative
     */
    _prepareDerivedAttributes() {
        const actorData = this.data;
			console.log("###################prepareDerivedAttributes#####"+actorData.name);
        if (!isLifeform(this.data.data))
            return;
        const data:Lifeform = this.data.data;

        // Store volatile
        if (data.physical) {
            data.physical.max = 8 + Math.round(data.attributes["bod"].pool / 2) + data.physical.mod;
            data.physical.value = data.physical.max - data.physical.dmg;
        }

        if (data.stun) {
            data.stun.max = 8 + Math.round(data.attributes["wil"].pool / 2) + data.stun.mod;
            data.stun.value = data.stun.max - data.stun.dmg;
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

		if (!data.derived) {
			data.derived = new Derived;
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
        if (data.derived.matrix_perception) {
        //data.derived.matrix_perception.base = data.skills["electronics"].points + data.skills["electronics"].modifier + data.attributes["int"].pool;
      		data.derived.matrix_perception.pool = data.derived.matrix_perception.base + data.derived.matrix_perception.mod;
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

        if (!isLifeform(data))
            return;
		if (!data.attackrating) data.attackrating = new Ratings;
		if (!data.attackrating.physical )  data.attackrating.physical = new Attribute();
		if (!data.attackrating.astral   )  data.attackrating.astral   = new Attribute();
		if (!data.attackrating.vehicle  )  data.attackrating.vehicle  = new Attribute();
		if (!data.attackrating.matrix   )  data.attackrating.matrix   = new Attribute();
		if (!data.attackrating.social   )  data.attackrating.social   = new Attribute();
		if (!data.attackrating.resonance)  data.attackrating.resonance= new Attribute();

		/* Physical Attack Rating - used for unarmed combat */
		data.attackrating.physical.base = data.attributes["rea"].pool + data.attributes["str"].pool;
		data.attackrating.physical.modString  = (game as Game).i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool+"\n";
		data.attackrating.physical.modString += (game as Game).i18n.localize("attrib.str_short") + " " + data.attributes["str"].pool;
		data.attackrating.physical.pool = data.attackrating.physical.base + data.attackrating.physical.mod;
		if (data.attackrating.physical.mod) {
			data.attackrating.physical.pool += data.attackrating.physical.mod;
			data.attackrating.physical.modString += "\n+" + data.attackrating.physical.mod;
		} 
		
		let traditionAttr = data.attributes[data.tradition.attribute];
		data.attackrating.astral.base = data.attributes["mag"].pool + traditionAttr.pool;
		data.attackrating.astral.modString  = (game as Game).i18n.localize("attrib.mag_short") + " " + data.attributes["mag"].pool+"\n";
		data.attackrating.astral.modString += (game as Game).i18n.localize("attrib."+data.tradition.attribute+"_short") + " " + data.attributes[data.tradition.attribute].pool;
		data.attackrating.astral.pool = data.attackrating.astral.base
		if (data.attackrating.astral.mod) {
			data.attackrating.astral.pool += data.attackrating.astral.mod;
			data.attackrating.astral.modString += "\n+" + data.attackrating.astral.mod;
		} 
		
		
		// Matrix attack rating (Angriff + Schleicher)
		if (isMatrixUser(data)) {
		if (data.persona && data.persona.used) {
			data.attackrating.matrix.base = data.persona.used.a + data.persona.used.s;
			data.attackrating.matrix.pool = data.attackrating.matrix.base;
			if (data.attackrating.matrix.mod) {
				data.attackrating.matrix.pool += data.attackrating.matrix.mod;
				data.attackrating.matrix.modString += "\n+" + data.attackrating.matrix.mod;
			} 
			}
		
		// Resonance attack rating (Electronics + Resonance)
		data.attackrating.resonance.base = data.persona.used.a + data.attributes["res"].pool;
		data.attackrating.resonance.modString  = (game as Game).i18n.localize("skill.electronics") + " + ";
		data.attackrating.resonance.modString += (game as Game).i18n.localize("attrib.res_short");
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
		data.attackrating.social.modString = (game as Game).i18n.localize("attrib.cha_short") + " " + data.attributes["cha"].pool;
		data.attackrating.social.pool = data.attackrating.social.base;
		if (data.attackrating.social.mod) {
			data.attackrating.social.pool += data.attackrating.social.mod;
			data.attackrating.social.modString += "\n+" + data.attackrating.social.mod;
		} 
		/*
		items.forEach(function (item, key) {
			if (item.type == "gear" && item.data.data.type == "ARMOR") {
				if (item.data.data.usedForPool) {
					data.attackrating.social.pool += item.data.data.social;
					data.attackrating.social.modString += "\n+" + item.data.data.social + " " + item.name;
				}
			}
		});
		*/
	}

	//---------------------------------------------------------
	/*
	 * Calculate the attributes like Initiative
	 */
	_prepareDefenseRatings() {
		const actorData = this.data;
		const data = this.data.data;
		const items = this.data.items;

        if (!isLifeform(data))
            return;

		if (!data.defenserating) data.defenserating = new Ratings;
		if (!data.defenserating.physical )  data.defenserating.physical = new Attribute();
		if (!data.defenserating.astral   )  data.defenserating.astral   = new Attribute();
		if (!data.defenserating.vehicle  )  data.defenserating.vehicle  = new Attribute();
		if (!data.defenserating.matrix   )  data.defenserating.matrix   = new Attribute();
		if (!data.defenserating.social   )  data.defenserating.social   = new Attribute();
		if (!data.defenserating.resonance)  data.defenserating.resonance= new Attribute();

		// Store volatile
			// Physical Defense Rating
			data.defenserating.physical.base = data.attributes["bod"].pool;
			data.defenserating.physical.modString = (game as Game).i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
			data.defenserating.physical.pool = data.defenserating.physical.base;
			if (data.defenserating.physical.mod) {
				data.defenserating.physical.pool += data.defenserating.physical.mod;
				data.defenserating.physical.modString += "<br/>\n+" + data.defenserating.physical.mod;
			} 
			
			items.forEach( item => {
				if (item.type == "gear" && (item.data.data as Gear).type == "ARMOR" && isArmor(item.data.data)) {
					if (item.data.data.usedForPool) {
						data.defenserating.physical.pool += item.data.data.defense;
						data.defenserating.physical.modString += "\n+" + item.data.data.defense + " " + item.name;
					}
				}
			});
			
			
			// Astral Defense Rating
			data.defenserating.astral.base = data.attributes["int"].pool;
			data.defenserating.astral.modString = (game as Game).i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defenserating.astral.pool = data.defenserating.astral.base;
			if (data.defenserating.astral.mod) {
				data.defenserating.astral.pool += data.defenserating.astral.mod;
				data.defenserating.astral.modString += "\n+" + data.defenserating.astral.mod;
			} 
			
			
			// Matrix defense
			if (isMatrixUser(data)) {
			data.defenserating.matrix.base = data.persona.used.d + data.persona.used.f;
			data.defenserating.matrix.modString = ""; //(game as Game).i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defenserating.matrix.pool = data.defenserating.matrix.base;
			if (data.defenserating.matrix.mod) {
				data.defenserating.matrix.pool += data.defenserating.matrix.mod;
				data.defenserating.matrix.modString += "\n+" + data.defenserating.matrix.mod;
			}
			} 
			
			// Vehicles Defense Rating (Pilot + Armor)
			data.defenserating.vehicle.base = data.skills["piloting"].pool;
			data.defenserating.vehicle.modString  = (game as Game).i18n.localize("skill.piloting") + " " + data.skills["piloting"].pool;
			//data.defenserating.vehicle.modString += "\n"+(game as Game).i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defenserating.vehicle.pool = data.defenserating.vehicle.base;
			if (data.defenserating.vehicle.mod) {
				data.defenserating.vehicle.pool += data.defenserating.vehicle.mod;
				data.defenserating.vehicle.modString += "\n+" + data.defenserating.vehicle.mod;
			} 
			
			
			// Social Defense Rating
			data.defenserating.social.base = data.attributes["cha"].pool;
			data.defenserating.social.modString = (game as Game).i18n.localize("attrib.cha_short") + " " + data.attributes["cha"].pool;
			data.defenserating.social.pool = data.defenserating.social.base;
			if (data.defenserating.social.mod) {
				data.defenserating.social.pool += data.defenserating.social.mod;
				data.defenserating.social.modString += "\n+" + data.defenserating.social.mod;
			} 
			/*
			items.forEach(function (item, key) {
				if (item.type == "gear" && item.data.data.type == "ARMOR") {
					if (item.data.data.usedForPool) {
						data.defenserating.social.pool += item.data.data.social;
						data.defenserating.social.modString += "\n+" + item.data.data.social + " " + item.name;
					}
				}
			});
			*/
	}

	//---------------------------------------------------------
	/*
	 * Calculate the final attribute values
	 */
	_prepareSkills() {
		const actorData = this.data;
		const data:Lifeform = (this.data.data as Lifeform);
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
        if (!isLifeform(this.data.data))
            return;
        const data:Lifeform = this.data.data;

		if (!data.defensepool) data.defensepool = new DefensePool;
		if (!data.defensepool.physical) data.defensepool.physical = new Pool;
		if (!data.defensepool.astral  ) data.defensepool.astral = new Pool;
		if (!data.defensepool.spells_direct) data.defensepool.spells_direct = new Pool;
		if (!data.defensepool.spells_indirect) data.defensepool.spells_indirect = new Pool;
		if (!data.defensepool.spells_other) data.defensepool.spells_other = new Pool;
		if (!data.defensepool.vehicle ) data.defensepool.vehicle = new Pool;
		if (!data.defensepool.toxin   ) data.defensepool.toxin = new Pool;
		if (!data.defensepool.damage_physical ) data.defensepool.damage_physical = new Pool;
		if (!data.defensepool.damage_astral ) data.defensepool.damage_astral = new Pool;
		if (!data.defensepool.drain   ) data.defensepool.drain = new Pool;
		if (!data.defensepool.fading  ) data.defensepool.fading = new Pool;
			
			// Physical Defense Test
			data.defensepool.physical.base = data.attributes["rea"].pool+ data.attributes["int"].pool;
 			data.defensepool.physical.modString = "\n"+(game as Game).i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
 			data.defensepool.physical.modString += "\n"+(game as Game).i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defensepool.physical.pool = data.defensepool.physical.base;
			if (data.defensepool.physical.mod) {
				data.defensepool.physical.pool += data.defensepool.physical.mod;
				data.defensepool.physical.modString += "\n+" + data.defensepool.physical.mod;
			} 
			
			// Astral(Combat) Defense Test
			data.defensepool.astral.base = data.attributes["log"].pool+ data.attributes["int"].pool;
 			data.defensepool.astral.modString = "\n"+(game as Game).i18n.localize("attrib.log_short") + " " + data.attributes["log"].pool;
 			data.defensepool.astral.modString += "\n"+(game as Game).i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defensepool.astral.pool = data.defensepool.astral.base;
			if (data.defensepool.astral.mod) {
				data.defensepool.astral.pool += data.defensepool.astral.mod;
				data.defensepool.astral.modString += "\n+" + data.defensepool.astral.mod;
			} 
			
			// Direct combat spell defense test
			data.defensepool.spells_direct.base = data.attributes["wil"].pool+ data.attributes["int"].pool;
 			data.defensepool.spells_direct.modString = "\n"+(game as Game).i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
 			data.defensepool.spells_direct.modString += "\n"+(game as Game).i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
			data.defensepool.spells_direct.pool = data.defensepool.spells_direct.base;
			if (data.defensepool.spells_direct.mod) {
				data.defensepool.spells_direct.pool += data.defensepool.spells_direct.mod;
				data.defensepool.spells_direct.modString += "\n+" + data.defensepool.spells_direct.mod;
			} 
			
			// Indirect combat spell defense test
			data.defensepool.spells_indirect.base = data.attributes["rea"].pool+ data.attributes["wil"].pool;
 			data.defensepool.spells_indirect.modString = "\n"+(game as Game).i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
 			data.defensepool.spells_indirect.modString += "\n"+(game as Game).i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.spells_indirect.pool = data.defensepool.spells_indirect.base;
			if (data.defensepool.spells_indirect.mod) {
				data.defensepool.spells_indirect.pool += data.defensepool.spells_indirect.mod;
				data.defensepool.spells_indirect.modString += "\n+" + data.defensepool.spells_indirect.mod;
			} 
			
			// Other spell defense test
			data.defensepool.spells_other.base = data.attributes["log"].pool+ data.attributes["wil"].pool;
 			data.defensepool.spells_other.modString = "\n"+(game as Game).i18n.localize("attrib.log_short") + " " + data.attributes["log"].pool;
 			data.defensepool.spells_other.modString += "\n"+(game as Game).i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.spells_other.pool = data.defensepool.spells_other.base;
			if (data.defensepool.spells_other.mod) {
				data.defensepool.spells_other.pool += data.defensepool.spells_other.mod;
				data.defensepool.spells_other.modString += "\n+" + data.defensepool.spells_other.mod;
			} 
			
			// Vehicle combat defense
			data.defensepool.vehicle.base = data.skills["piloting"].pool+ data.attributes["rea"].pool;
 			data.defensepool.vehicle.modString = "\n"+(game as Game).i18n.localize("skill.piloting") + " " + data.skills["piloting"].pool;
 			data.defensepool.vehicle.modString += "\n"+(game as Game).i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
			data.defensepool.vehicle.pool = data.defensepool.vehicle.base;
			if (data.defensepool.vehicle.mod) {
				data.defensepool.vehicle.pool += data.defensepool.vehicle.mod;
				data.defensepool.vehicle.modString += "\n+" + data.defensepool.vehicle.mod;
			} 
			
			// Resist toxin
			data.defensepool.toxin.base = data.attributes["bod"].pool+ data.attributes["wil"].pool;
 			data.defensepool.toxin.modString = "\n"+(game as Game).i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
 			data.defensepool.toxin.modString += "\n"+(game as Game).i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.toxin.pool = data.defensepool.toxin.base;
			if (data.defensepool.toxin.mod) {
				data.defensepool.toxin.pool += data.defensepool.toxin.mod;
				data.defensepool.toxin.modString += "\n+" + data.defensepool.toxin.mod;
			} 
			
			// Resist physical damage
			data.defensepool.damage_physical.base = data.attributes["bod"].pool;
 			data.defensepool.damage_physical.modString = "\n"+(game as Game).i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
			data.defensepool.damage_physical.pool = data.defensepool.damage_physical.base;
			if (data.defensepool.damage_physical.mod) {
				data.defensepool.damage_physical.pool += data.defensepool.damage_physical.mod;
				data.defensepool.damage_physical.modString += "\n+" + data.defensepool.damage_physical.mod;
			} 
			
			// Resist astral damage
			data.defensepool.damage_astral.base = data.attributes["wil"].pool;
 			data.defensepool.damage_astral.modString = "\n"+(game as Game).i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.damage_astral.pool = data.defensepool.damage_astral.base;
			if (data.defensepool.damage_astral.mod) {
				data.defensepool.damage_astral.pool += data.defensepool.damage_astral.mod;
				data.defensepool.damage_astral.modString += "\n+" + data.defensepool.damage_astral.mod;
			} 
			
			// Resist drain
			let traditionAttr = data.attributes[data.tradition.attribute];
			data.defensepool.drain.base = traditionAttr.pool + data.attributes["wil"].pool;
 			data.defensepool.drain.modString = "\n"+(game as Game).i18n.localize("attrib."+data.tradition.attribute+"_short") + " " + traditionAttr.pool;
 			data.defensepool.drain.modString += "\n"+(game as Game).i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
			data.defensepool.drain.pool = data.defensepool.drain.base;
			if (data.defensepool.drain.mod) {
				data.defensepool.drain.pool += data.defensepool.drain.mod;
				data.defensepool.drain.modString += "\n+" + data.defensepool.drain.mod;
			} 
			
			// Resist fading
			data.defensepool.fading.base = data.attributes["wil"].pool + data.attributes["log"].pool;
 			data.defensepool.fading.modString = "\n"+(game as Game).i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
 			data.defensepool.fading.modString += "\n"+(game as Game).i18n.localize("attrib.log_short") + " " + data.attributes["log"].pool;
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
		const itemUser = this.data.data as Lifeform;

		actorData.items.forEach(tmpItem => {

			let item = tmpItem.data;
			if (item.type == "gear" && item.data && isGear(item.data)) {
				let gear:Gear = (item.data as Gear);
				if (gear.skill && gear.skill!="") {
					console.log("Item"+item.name+" has skillspec "+gear.skill+" / "+gear.skillSpec+" of ",item);
				//item.data.pool = tmpItem.actor.data.data.skills[item.data.skill].pool;
					gear.pool = this._getSkillPool(item.data.skill, gear.skillSpec, itemUser.skills[gear.skill].attrib);
					gear.pool = gear.pool + +gear.modifier;
				}
			};
			if (tmpItem.type == "gear" && isWeapon(item.data)) {
				if (item.data.stun) {
					if ( (item.data.stun as any)==='false') {
						item.data.stun = false;
					} else if ((item.data.stun as any)==='true') { 
						item.data.stun = true;
					}
				}
				let suffix = item.data.stun?(game as Game).i18n.localize("shadowrun6.item.stun_damage"):(game as Game).i18n.localize("shadowrun6.item.physical_damage");
				item.data.dmgDef = item.data.dmg+suffix;
			}
			
			if (tmpItem.type == "complexform" && isComplexForm(item.data)) {
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
        if (!isLifeform(this.data.data))
            return;
		const actorData :Lifeform = this.data.data;

		if (!actorData.controlRig) {
			actorData.controlRig=0;
		}

		this.data.items.forEach(tmpItem => {
			// Any kind of gear
			if (tmpItem.type == "gear" && isVehicle(tmpItem.data.data)) {
				let vehicleData : Vehicle = tmpItem.data.data; 
				if (!vehicleData.vehicle) {
					vehicleData.vehicle = new CurrentVehicle();
				}
				let current : CurrentVehicle = vehicleData.vehicle;
				//if (!current.attrib)  current.attrib="rea";
				if (!current.ar)  current.ar=new Pool;
				if (!current.dr)  current.dr=new Pool;
				if (!current.handling)  current.handling=new Pool();
				
				let specialization = vehicleData.vtype;
				if ("GROUND" === specialization) { specialization = "ground_craft"; }
				if ("WATER"  === specialization) { specialization = "watercraft"; }
				if ("AIR"    === specialization) { specialization = "aircraft"; }
				
				vehicleData.skillSpec = specialization;
				let opMode = current.opMode;
				let rigRating : number = actorData.controlRig; 
				let modRig = "";
				if (rigRating>0) {
					modRig = " + "+(game as Game).i18n.localize("shadowrun6.item.vehicle.rigRating.long")+" ("+rigRating+")";
				}
				switch (opMode) {
				case "manual":
					rigRating = 0; 
					modRig = "";
				case "riggedAR":
					current.ar.pool = actorData.skills.piloting.points + vehicleData.sen + +rigRating;
					current.ar.modString = 
						(game as Game).i18n.localize("skill.piloting")+"("+actorData.skills.piloting.points+") +"+ 
						(game as Game).i18n.localize("shadowrun6.item.vehicle.sensor.long")+" ("+vehicleData.sen+")"+
						modRig;
					current.dr.pool = actorData.skills.piloting.points + vehicleData.arm + +rigRating;
					current.dr.modString = 
						(game as Game).i18n.localize("skill.piloting")+"("+actorData.skills.piloting.points+") +"+ 
						(game as Game).i18n.localize("shadowrun6.item.vehicle.armor.long")+" ("+vehicleData.arm+")"+
						modRig;
					current.handling.pool = this._getSkillPool("piloting",specialization,"rea") + +rigRating;
					current.handling.modString = 
						(game as Game).i18n.localize("skill.piloting")+"("+actorData.skills.piloting.points+") +"+ 
						(game as Game).i18n.localize("attrib.rea_short")+"("+actorData.attributes.rea.pool+")"+
						modRig;
					break;
				case "riggedVR":
					//item.data.vehicle.attrib="int";
					current.ar.pool = actorData.skills.piloting.points + vehicleData.sen + +rigRating;
					current.ar.modString = 
						(game as Game).i18n.localize("skill.piloting")+"("+actorData.skills.piloting.points+") +"+ 
						(game as Game).i18n.localize("shadowrun6.item.vehicle.sensor.long")+" ("+vehicleData.sen+")"+
						modRig;
					current.dr.pool = actorData.skills.piloting.points + vehicleData.arm + +rigRating;
					current.dr.modString = 
						(game as Game).i18n.localize("skill.piloting")+"("+actorData.skills.piloting.points+") +"+ 
						(game as Game).i18n.localize("shadowrun6.item.vehicle.armor.long")+" ("+vehicleData.arm+")"+
						modRig;
					current.handling.pool = this._getSkillPool("piloting",specialization,"int")+ +rigRating;
					current.handling.modString = 
						(game as Game).i18n.localize("skill.piloting")+"("+actorData.skills.piloting.points+") +"+ 
						(game as Game).i18n.localize("attrib.int_short")+"("+actorData.attributes.int.pool+")"+
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
		const actorData  = this.data;
		const data : VehicleActor = (this.data.data as VehicleActor);

		// Monitors
			if (data.physical) {
				if (!data.physical.mod) data.physical.mod=0;
				
				let base:number = 8 + Math.round(data.bod / 2);
				data.physical.max = +base + data.physical.mod;
				data.physical.value = data.physical.max - data.physical.dmg;
			}
			// Use "stun" as matrix condition
			if (data.stun) {
				if (!data.stun.mod) data.stun.mod=0;
				// 8 + (Device Rating / 2) where Dev.Rat. is Sensor
				let base : number = 8 + Math.round(data.sen / 2);
				data.stun.max = +base + data.stun.mod;
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
		const actorData:Player = (this.data.data as Player);

		if (!actorData.persona            ) actorData.persona = new Persona;
		if (!actorData.persona.base       ) actorData.persona.base = new MatrixDevice;
		if (!actorData.persona.used       ) actorData.persona.used = new MatrixDevice;
		if (!actorData.persona.monitor    ) actorData.persona.monitor = new Monitor;
		
		this.data.items.forEach(tmpItem => {
			if (tmpItem.type == "gear" && isMatrixDevice(tmpItem.data.data)) {
				let item:MatrixDevice = tmpItem.data.data;
				if (item.subtype == "COMMLINK" || item.subtype == "CYBERJACK") {
					if (item.usedForPool) {
						actorData.persona.base.d = item.d;
						actorData.persona.base.f = item.f;
						if (! actorData.persona.monitor.max) {
							actorData.persona.monitor.max = ((item.subtype == "COMMLINK")?item.devRating:item.devRating)/2 +8;							
						}
					}
				};
				if (item.subtype == "CYBERDECK") {
					if (item.usedForPool) {
						actorData.persona.base.a = item.a;
						actorData.persona.base.s = item.s;
						actorData.persona.monitor.max =item.devRating/2 +8;		
					}
				};
			}			
		});
		
/*		if (!actorData.persona.used     ) actorData.persona.used = {};
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
*/	}

	//---------------------------------------------------------
	/*
	 * Calculate the attributes like Initiative
	 */
	_calculateEssence() {
		const actorData = this.data;
		if (!isLifeform(this.data.data))
			return;
		const data:Lifeform = this.data.data;
		
		let essence = 6.0;
		actorData.items.forEach(tmpItem => {
			let item = tmpItem.data;
			if (item.type == "gear" && item.data && (item.data as any).essence) {
				essence -= (item.data as any).essence;
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
	_getSkillCheckText(roll:SkillRoll) : string {
		
		// Build test name
		let rollName = (game as Game).i18n.localize("skill." + roll.skillId);
		if (roll.skillSpec) {
			rollName += "/"+(game as Game).i18n.localize("shadowrun6.special." + roll.skillId+"."+roll.skillSpec);
		}
		rollName += " + ";
		// Attribute
		let useAttrib = (roll.attrib!=undefined)?roll.attrib : CONFIG.SR6.ATTRIB_BY_SKILL.get(roll.skillId)!.attrib;
		let attrName = (game as Game).i18n.localize("attrib."+useAttrib);
		rollName += attrName;
		
		if (roll.threshold && roll.threshold>0) {
			rollName += " ("+roll.threshold+")";
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
	_getSkillPool(skillId, spec, attrib:string|undefined = undefined) {
		if (!skillId)
			throw "Skill ID may not be undefined";
		const skl = (this.data.data as Lifeform).skills[skillId];
		if (!skillId) {
			throw "Unknown skill '"+skillId+"'";
		}
			
		let skillDef : SkillDefinition = CONFIG.SR6.ATTRIB_BY_SKILL.get(skillId)!;
		if (!attrib) {
			attrib = skillDef.attrib;
		}
			
		// Calculate pool
		let value = skl.points + skl.modifier;
		if (skl.base==0) {
			if (skillDef.useUntrained) {value-=1;}
			else
				return 0;
		}
		
		if (spec) {
			if (spec==skl.expertise) {
				value+=3;
			} else if (spec==skl.specialization) {
				value+=2;
			}
		}
		
		// Add attribute
		value = parseInt(value);
		value += parseInt( (this.data.data as Lifeform).attributes[attrib].pool );
		
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
			let name = (game as Game).i18n.localize(key);
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
	_getSpellName(spell:Spell, item:Item):string|null {
		if (spell.genesisID) {
			const key = "shadowrun6.compendium.spell." + spell.genesisID;
			let name = (game as Game).i18n.localize(key);
			if (key!=name)
				return name;
		}
		
		if (item)
			return item.name;
		throw new Error("Spell: No genesisID and no item");
	}

	//---------------------------------------------------------
	/**
	 * Return a translated gear name
	 * @param {Object} item   The gear to use
	 * @return Display name
	 */
	_getGearName(gear:Gear, item:Item) : string|null {
		if (gear.genesisID) {
			const key = "shadowrun6.compendium.gear." + gear.genesisID;
			let name = (game as Game).i18n.localize(key);
			if (key!=name)
				return name;
		}
		
		if (item)
			return item.name;
		throw new Error("Gear: No genesisID and no item");
	}

	//---------------------------------------------------------
	/**
	 * @param {Function} func   function to return value from actor
	 * @return Value
	 */
	_getHighestDefenseRating(map) {
		let highest = 0;
		for (var it = (game as Game).user!.targets.values(), val= null; val=it.next().value; ) {
			console.log("_getHighestDefenseRating: Target Token: val = " , val);
			let token : Token = val as Token;
			let actor : Shadowrun6Actor  = token.actor as Shadowrun6Actor;
			let here : number = map(actor);
			if (here>highest)
				highest = here;
      }
		return highest;
	}

	//---------------------------------------------------------
	/**
	 * @param roll	Skill roll to manipulate
	 */
	updateSkillRoll(roll : SkillRoll, attrib : string) {
		// Prepare check text
		roll.checkText = this._getSkillCheckText(roll);
		// Calculate pool
		roll.pool  = this._getSkillPool(roll.skillId, roll.skillSpec, attrib);
		console.log("updateSkillRoll()", roll);
		
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
	rollSkill(roll : SkillRoll) : Promise<Roll> {
		console.log("rollSkill(", roll, ")");
		roll.actor     = this;
		// Prepare check text
		roll.checkText = this._getSkillCheckText(roll);
		// Find attribute
		let skillDef : SkillDefinition = CONFIG.SR6.ATTRIB_BY_SKILL.get(roll.skillId)!;
		if (!roll.attrib)
			roll.attrib = skillDef.attrib; 
		roll.actionText = roll.checkText; // (game as Game).i18n.format("shadowrun6.roll.actionText.skill");

		// Calculate pool
		roll.pool  = this._getSkillPool(roll.skillId, roll.skillSpec);
		console.log("rollSkill(", roll, ")");

		roll.allowBuyHits = true;
		
		roll.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(roll);
	}

	//-------------------------------------------------------------
	/*
	 *
	 */
	rollItem(roll : WeaponRoll) {
		console.log("rollItem(", roll, ")");
		roll.actor     = this;
		// Prepare check text
		roll.checkText = this._getSkillCheckText(roll);
		// Calculate pool
		if (roll.pool==0) {
			roll.pool  = this._getSkillPool(roll.skillId, roll.skillSpec);
		}
		console.log("rollItem(", roll, ")");
		let item : Gear = roll.gear;

		roll.allowBuyHits = true;
		
		// If present, replace item name, description and source references from compendium
		roll.itemName = roll.item.name;
		if (roll.gear.description) {
			roll.itemDesc = roll.gear.description;
		}
		if (roll.gear.genesisID) {
			let key = "item."+roll.gear.genesisID+".";
			if (!(game as Game).i18n.localize(key+"name").startsWith(key)) {
				// A translation exists
				roll.itemName = (game as Game).i18n.localize(key+"name");
				roll.itemDesc = (game as Game).i18n.localize(key+"desc");
				roll.itemSrc  = (game as Game).i18n.localize(key+"src");
			}
		}
		
		
		switch ((game as any).user.targets.size) {
		case 0:
			roll.actionText = (game as Game).i18n.format("shadowrun6.roll.actionText.attack_target_none", {name:roll.itemName});
			break;
		case 1:
		   let targetName = (game as any).user.targets.values().next().value.name;
			roll.actionText = (game as Game).i18n.format("shadowrun6.roll.actionText.attack_target_one", {name:roll.itemName, target:targetName});
			break;
		default:
			roll.actionText = (game as Game).i18n.format("shadowrun6.roll.actionText.attack_target_multiple", {name:roll.itemName});
		}
		// Prepare check text
		let checkText = this._getSkillCheckText(roll);

		roll.targets = (game as Game).user!.targets.values();
		roll.defenseRating = this._getHighestDefenseRating( a =>  a.data.data.defenserating.physical.pool);
		console.log("Highest defense rating of targets: "+roll.defenseRating);

		roll.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(roll);
		
	}

	//-------------------------------------------------------------
	/**
	 * Roll a spell test. Some spells are opposed, some are simple tests.
	 * @param {string} itemId       The item id of the spell
	 * @param {boolean} ritual      TRUE if ritual spellcasting is used
	 * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
	 */
	rollSpell(roll : SpellRoll, ritual:boolean) : Promise<Roll> {
		console.log("rollSpell( roll="+roll+", ritual="+ritual+")");
		
		roll.skillSpec  = (ritual)?"ritual_spellcasting":"spellcasting";
		roll.threshold = 0;
		
		// If present, replace spell name, description and source references from compendium
		roll.spellName = this._getSpellName(roll.spell, roll.item);
		if (roll.spell.description) {
			roll.spellDesc = roll.spell.description;
		}
		if (roll.spell.genesisID) {
			let key = (ritual?"ritual.":"spell.")+roll.spell.genesisID+".";
			if (!(game as Game).i18n.localize(key+"name").startsWith(key)) {
				// A translation exists
				roll.spellName = (game as Game).i18n.localize(key+"name");
				roll.spellDesc = (game as Game).i18n.localize(key+"desc");
				roll.spellSrc = (game as Game).i18n.localize(key+"src");
			}
		}
	
		// Prepare action text
		switch ((game as Game).user!.targets.size) {
		case 0:
			roll.actionText = (game as Game).i18n.format("shadowrun6.roll.actionText.cast_target_none", {name:roll.spellName});
			break;
		case 1:
		   let targetName = (game as Game).user!.targets.values().next().value.name;
			roll.actionText = (game as Game).i18n.format("shadowrun6.roll.actionText.cast_target_one", {name:roll.spellName, target:targetName});
			break;
		default:
			roll.actionText = (game as Game).i18n.format("shadowrun6.roll.actionText.cast_target_multiple", {name:roll.spellName});
		}
		roll.actor     = this;
		// Prepare check text
		roll.checkText = this._getSkillCheckText(roll);
		// Calculate pool
		roll.pool  = this._getSkillPool(roll.skillId, roll.skillSpec);

		// Determine whether or not the spell is an opposed test
		// and what defense eventually applies
		let hasDamageResist = !ritual;
		roll.attackRating = roll.performer.attackrating.astral.pool;
		let highestDefenseRating = this._getHighestDefenseRating( a =>  a.data.data.defenserating.physical.pool);
		console.log("Highest defense rating of targets: "+highestDefenseRating);
		roll.canAmpUpSpell   = roll.spell.category === "combat";
		roll.canIncreaseArea = roll.spell.range==="line_of_sight_area" || roll.spell.range==="self_area";
		if (roll.spell.category === "combat") {
			if (roll.spell.type=="mana") {
				roll.defendWith = Defense.SPELL_DIRECT;
				hasDamageResist = false;
			} else {
				roll.defendWith = Defense.SPELL_INDIRECT;
			}
		} else if (roll.spell.category === "manipulation") {
				roll.defendWith = Defense.SPELL_OTHER;
		} else if (roll.spell.category === "heal") {
			if (roll.spell.withEssence && isLifeform(this.data.data)) {
				roll.threshold = 5 - Math.ceil(this.data.data.essence);
			}
		}
		
		roll.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(roll);
	}

	//-------------------------------------------------------------
	/**
	 */
	rollDefense(defendWith :Defense, threshold:number, damage : number) {
		console.log("ToDo rollDefense("+defendWith+", "+threshold+","+damage+")");

		const data:SR6Actor = this.data.data as SR6Actor;
		if (!isLifeform(data)) {
			throw  "Can only roll defenses for lifeforms";
		}
		
		let defensePool : Pool|undefined = undefined;
		let rollData : DefenseRoll = new DefenseRoll(threshold);
		let gameI18n : Localization = (game as Game).i18n;
		switch (defendWith) {
		case Defense.PHYSICAL:
			defensePool = data.defensepool.physical;
			rollData.actionText = gameI18n.format("shadowrun6.roll.actionText.defense."+defendWith, {threshold:0});
			rollData.checkText = gameI18n.localize("attrib.rea")+" + "+gameI18n.localize("attrib.int")+" ("+threshold+")";
			break;
		case Defense.SPELL_INDIRECT:
			defensePool = data.defensepool.spells_indirect;
			rollData.actionText = gameI18n.localize("shadowrun6.roll.actionText.defense."+defendWith);
			rollData.checkText = gameI18n.localize("attrib.rea")+" + "+gameI18n.localize("attrib.wil")+" ("+threshold+")";
			break;
		case Defense.SPELL_DIRECT:
			defensePool = data.defensepool.spells_direct;
			rollData.actionText = gameI18n.localize("shadowrun6.roll.actionText.defense."+defendWith);
			rollData.checkText = gameI18n.localize("attrib.wil")+" + "+gameI18n.localize("attrib.int")+" ("+threshold+")";
			break;
		case Defense.SPELL_OTHER:
			defensePool = data.defensepool.spells_other;
			rollData.actionText = gameI18n.localize("shadowrun6.roll.actionText.defense."+defendWith);
			rollData.checkText = gameI18n.localize("attrib.wil")+" + "+gameI18n.localize("attrib.int");
			break;
		default:
			console.log("Error! Don't know how to handle defense pool for "+defendWith)
			throw "Error! Don't know how to handle defense pool for "+defendWith;
		}
		
		console.log("Defend with pool ",defensePool);
		// Prepare action text
		console.log("before ",rollData);
		rollData.threshold  = threshold;
		console.log("after ",rollData);
		rollData.damage     = damage;
		rollData.actor      = this;
		rollData.allowBuyHits= false;
		rollData.pool       = defensePool.pool!;
		rollData.rollType   = RollType.Defense;
		rollData.performer  = data;
		rollData.speaker = ChatMessage.getSpeaker({ actor: this });
		console.log("Defend roll config ",rollData);
		return doRoll(rollData);

	}

	//-------------------------------------------------------------
	/**
	 */
	rollSoak(soak :SoakType, damage:number) {
		console.log("rollSoak: "+damage+" "+soak);
		

		const data:SR6Actor = this.data.data as SR6Actor;
		if (!isLifeform(data)) {
			throw  "Can only roll defenses for lifeforms";
		}
		
		let defensePool : Pool|undefined = undefined;
		let rollData : SoakRoll = new SoakRoll(damage);
		let gameI18n : Localization = (game as Game).i18n;
		switch (soak) {
		case SoakType.DAMAGE_PHYSICAL:
			defensePool = data.defensepool.physical;
			rollData.monitor    = MonitorType.PHYSICAL;
			rollData.actionText = gameI18n.format("shadowrun6.roll.actionText.soak."+soak, {damage:damage});
			rollData.checkText = gameI18n.localize("attrib.bod")+" + ? ("+damage+")";
			break;
		case SoakType.DAMAGE_STUN:
			defensePool = data.defensepool.physical;
			rollData.monitor    = MonitorType.STUN;
			rollData.actionText = gameI18n.format("shadowrun6.roll.actionText.soak."+soak, {damage:damage});
			rollData.checkText = gameI18n.localize("attrib.bod")+" + ? ("+damage+")";
			break;
		case SoakType.DRAIN:
			defensePool = data.defensepool.drain;
			rollData.monitor    = MonitorType.STUN;
			rollData.actionText = gameI18n.format("shadowrun6.roll.actionText.soak."+soak, {damage:damage});
			rollData.checkText = gameI18n.localize("attrib.wil")+" + ? ("+damage+")";
			if (data.tradition!=null) {
				rollData.checkText = gameI18n.localize("attrib.wil")+" + "+gameI18n.localize("attrib."+data.tradition.attribute)+" ("+damage+")";
			}
			break;
		default:
			console.log("Error! Don't know how to handle soak pool for "+soak)
			throw "Error! Don't know how to handle soak pool for "+soak;
		}
		
		console.log("Defend with pool ",defensePool);
		// Prepare action text
		console.log("before ",rollData);
		rollData.threshold  = damage;
		console.log("after ",rollData);
		rollData.actor      = this;
		rollData.allowBuyHits= false;
		rollData.pool       = defensePool.pool!;
		rollData.performer  = data;
		rollData.speaker = ChatMessage.getSpeaker({ actor: this });
		console.log("Soak roll config ",rollData);
		return doRoll(rollData);
	}

	//---------------------------------------------------------
	/**
	 */
	performMatrixAction(roll : MatrixActionRoll) {
		console.log("ToDo performMatrixAction:",roll);
		
		if (!isLifeform(this.data.data)) {
			throw new Error("Must be executed by an Actor with Lifeform data");
		}
		
		let action : MatrixAction = roll.action;
		roll.attrib = action.attrib;
		roll.skillId   = action.skill;
		roll.skillSpec = action.spec;
		roll.threshold = action.threshold;
		// Prepare action text
		roll.actionText = (game as Game).i18n.localize("shadowrun6.matrixaction."+action.id);
		// Prepare check text
		if (!action.skill) {
			console.log("ToDo: matrix actions without a test");
			return;
		}
		roll.checkText = this._getSkillCheckText(roll);
		// Calculate pool
		roll.pool = this._getSkillPool(action.skill, action.spec, action.attrib);
	
		/*
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
		*/
		roll.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(roll);
		
	}

	//-------------------------------------------------------------
	/**
	 * Roll a complex form test. Some complex forms are opposed, some are simple tests.
	 * @param {string} itemId       The item id of the spell
	 * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
	 */
	rollComplexForm(itemId, options={}) {
		console.log("ToDo: rollComplexForm("+itemId+")");
		// Caster must be a lifeform
		if (!isLifeform(this.data.data)) {
			return;
		}

		/*
		const complex = this.items.get(itemId);
		let skillId = complex.data.data.skill;
		if (!skillId)
			skillId = "electronics";
		const spec    = null;
		let threshold = complex.data.data.threshold;
		// Prepare action text
		let actionText = (game as Game).i18n.format("shadowrun6.roll.actionText.thread", {name:this._getComplexFormName(complex)});
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
			if (!(game as Game).i18n.localize(key+"name").startsWith(key)) {
				// A translation exists
				spellName = (game as Game).i18n.localize(key+"name");
				spellDesc = (game as Game).i18n.localize(key+"desc");
				spellSrc = (game as Game).i18n.localize(key+"src");
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
		*/
	}

	//-------------------------------------------------------------
	applyDamage(monitor : MonitorType, damage : number) {
		console.log("ToDo: applyDamage("+monitor+", "+damage+")")
		const data:Lifeform = this.data.data as Lifeform;
		const damageObj : Monitor = data[monitor];
		
		console.log("damageObj = ",damageObj);
		
		let newDmg = damageObj.dmg + damage;
		// Did damage overflow the monitor?
      let overflow : number = Math.max(0, newDmg - damageObj.max);
		console.log("newDmg=",newDmg,"   overflow=",overflow);
		// Ensure actual damage is not higher than pool
		newDmg = Math.min(Math.max(0, newDmg), damageObj.max);
		
		this.data.update({[`data.overflow.dmg`]: overflow});
      this.data.update({[`data.`+monitor+`.dmg`]: newDmg });
		console.log("Added "+damage+" to monitor "+monitor+" of "+this.data.name+" which results in overflow "+overflow+" on "+this.name);
		this._prepareDerivedAttributes();
		console.log("ToDo: update tokens ",this.data.token);
	}

	//-------------------------------------------------------------
	/*
	 *
	 */
	rollCommonCheck(roll : PreparedRoll, dialogConfig:any, options = {}) {
		console.log("rollCommonCheck");

		roll.actor     = this;
		roll.speaker = ChatMessage.getSpeaker({ actor: this });
		return doRoll(roll);	
	}
	
	/***************************************
	 *
	 **************************************/
   getMaxEdgeGainThisRound(): number {
		return 2;
   }

}