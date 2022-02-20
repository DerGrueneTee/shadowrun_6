import { SR6Config } from "./config.js";
function isLifeform(obj) {
    return obj.attributes != undefined;
}
export class Shadowrun6Actor extends Actor {
    /**
     * @Override
     */
    prepareData() {
        super.prepareData();
        console.log("Shadowrun6Actor.prepareData() " + this.data.name + " = " + this.data.type);
        const data = this.data.data;
        try {
            this._prepareAttributes();
            this._prepareDerivedAttributes();
            if (this.data.type != "Vehicle" && this.data.type != "Critter") {
                // this._preparePersona();
                // this._prepareAttackRatings();
                // this._prepareDefenseRatings();
                // this._prepareSkills();
                // this._prepareDefensePools();
                // this._prepareItemPools();
                // this._prepareVehiclePools();
                // this._calculateEssence();
                //     if (data.mortype) {
                //         data.morDef = SR6.MOR_DEFINITIONS[data.mortype];
                //     }
                // }
                // if (this.data.type === 'Critter') {
                //     this._prepareAttributes();
                //     this._prepareDerivedAttributes();
                //     this._prepareAttackRatings();
                //     this._prepareDefenseRatings();
                //     this._prepareSkills();
                //     this._prepareDefensePools();
                //     this._prepareItemPools();
                // }
                // if (this.data.type === 'Vehicle') {
                //     this._prepareDerivedVehicleAttributes();
            }
        }
        catch (err) {
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
            console.log("Lifeform");
            SR6Config.PRIMARY_ATTRIBUTES.forEach(attr => {
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
        const data = this.data.data;
        if (!isLifeform(data))
            return;
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
        //data.derived.matrix_perception.base = data.skills["electronics"].points + data.skills["electronics"].modifier + data.attributes["int"].pool;
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
        if (!isLifeform(data))
            return;
        /*
                if (!data.attackrating.physical )  data.attackrating.physical = new Attribute();
                if (!data.attackrating.astral   )  data.attackrating.astral   = new Attribute();
                if (!data.attackrating.vehicle  )  data.attackrating.vehicle  = new Attribute();
                if (!data.attackrating.matrix   )  data.attackrating.matrix   = new Attribute();
                if (!data.attackrating.social   )  data.attackrating.social   = new Attribute();
                if (!data.attackrating.resonance)  data.attackrating.resonance= new Attribute();
        */
        /* Physical Attack Rating - used for unarmed combat */
        data.attackrating.physical.base = data.attributes["rea"].pool + data.attributes["str"].pool;
        //		data.attackrating.physical.modString  = game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool+"\n";
        //		data.attackrating.physical.modString += game.i18n.localize("attrib.str_short") + " " + data.attributes["str"].pool;
        data.attackrating.physical.pool = data.attackrating.physical.base + data.attackrating.physical.mod;
        if (data.attackrating.physical.mod) {
            data.attackrating.physical.pool += data.attackrating.physical.mod;
            data.attackrating.physical.modString += "\n+" + data.attackrating.physical.mod;
        }
        let traditionAttr = data.attributes[data.tradition.attribute];
        data.attackrating.astral.base = data.attributes["mag"].pool + traditionAttr.pool;
        //		data.attackrating.astral.modString  = game.i18n.localize("attrib.mag_short") + " " + data.attributes["mag"].pool+"\n";
        //		data.attackrating.astral.modString += game.i18n.localize("attrib."+data.tradition.attribute+"_short") + " " + data.attributes[data.tradition.attribute].pool;
        data.attackrating.astral.pool = data.attackrating.astral.base;
        if (data.attackrating.astral.mod) {
            data.attackrating.astral.pool += data.attackrating.astral.mod;
            data.attackrating.astral.modString += "\n+" + data.attackrating.astral.mod;
        }
        /*
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
//		data.attackrating.resonance.modString  = game.i18n.localize("skill.electronics") + " + ";
//		data.attackrating.resonance.modString += game.i18n.localize("attrib.res_short");
        data.attackrating.resonance.pool = data.attackrating.resonance.base;
        if (data.attackrating.resonance.mod) {
            data.attackrating.resonance.pool += data.attackrating.resonance.mod;
            data.attackrating.resonance.modString += "\n+" + data.attackrating.resonance.mod;
        }
        }
            */
        // Vehicle combat attack rating (Pilot + Sensor)
        data.attackrating.vehicle.base = 0; //data.attributes["rea"].pool + data.attributes["str"].pool;
        data.attackrating.vehicle.pool = data.attackrating.vehicle.base;
        if (data.attackrating.vehicle.mod) {
            data.attackrating.vehicle.pool += data.attackrating.vehicle.mod;
            data.attackrating.vehicle.modString += "\n+" + data.attackrating.vehicle.mod;
        }
        // Social value
        data.attackrating.social.base = data.attributes["cha"].pool;
        //		data.attackrating.social.modString = game.i18n.localize("attrib.cha_short") + " " + data.attributes["cha"].pool;
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
        // Store volatile
        if (actorData.type === "Player" || actorData.type === "NPC") {
            /*			if (!data.defenserating) {
                            data.defenserating = {};
                        }
                        if (!data.defenserating.physical)  data.defenserating.physical = { mod: 0};
                        if (!data.defenserating.astral  )  data.defenserating.astral   = { mod: 0};
                        if (!data.defenserating.vehicle )  data.defenserating.vehicle  = { mod: 0};
                        if (!data.defenserating.matrix  )  data.defenserating.matrix   = { mod: 0};
                        if (!data.defenserating.social  )  data.defenserating.social   = { mod: 0};
            */
            // Physical Defense Rating
            data.defenserating.physical.base = data.attributes["bod"].pool;
            //			data.defenserating.physical.modString = game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
            data.defenserating.physical.pool = data.defenserating.physical.base;
            if (data.defenserating.physical.mod) {
                data.defenserating.physical.pool += data.defenserating.physical.mod;
                data.defenserating.physical.modString += "<br/>\n+" + data.defenserating.physical.mod;
            }
            /*
            items.forEach(function (item, key) {
                if (item.type == "gear" && item.data.data.type == "ARMOR") {
                    if (item.data.data.usedForPool) {
                        data.defenserating.physical.pool += item.data.data.defense;
                        data.defenserating.physical.modString += "\n+" + item.data.data.defense + " " + item.name;
                    }
                }
            });
            */
            // Astral Defense Rating
            data.defenserating.astral.base = data.attributes["int"].pool;
            //			data.defenserating.astral.modString = game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
            data.defenserating.astral.pool = data.defenserating.astral.base;
            if (data.defenserating.astral.mod) {
                data.defenserating.astral.pool += data.defenserating.astral.mod;
                data.defenserating.astral.modString += "\n+" + data.defenserating.astral.mod;
            }
            /*
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
//			data.defenserating.vehicle.modString  = game.i18n.localize("skill.piloting") + " " + data.skills["piloting"].pool;
            //data.defenserating.vehicle.modString += "\n"+game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
            data.defenserating.vehicle.pool = data.defenserating.vehicle.base;
            if (data.defenserating.vehicle.mod) {
                data.defenserating.vehicle.pool += data.defenserating.vehicle.mod;
                data.defenserating.vehicle.modString += "\n+" + data.defenserating.vehicle.mod;
            }
            */
            // Social Defense Rating
            data.defenserating.social.base = data.attributes["cha"].pool;
            //			data.defenserating.social.modString = game.i18n.localize("attrib.cha_short") + " " + data.attributes["cha"].pool;
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
    }
}
