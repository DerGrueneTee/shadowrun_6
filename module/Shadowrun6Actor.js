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
        console.log("hallo Welt! "+this.data.name);
        
        console.log("TODO: calculate derived attributes (e.g. Initiative) for "+this.data.type);
        const data = this.data.data;
        this._prepareAttributes();
        this._prepareDerivedAttributes();
        this._prepareSkills();
   }

    //---------------------------------------------------------
    /*
     * Calculate the final attribute values
     */
    _prepareAttributes() {
    	const actorData = this.data;
        const data =  this.data.data;
        // Only calculate for PCs - ignore for NPCs/Critter
        if (actorData.type === "Player") {
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
        const data =  this.data.data;

        // Store volatile
         
//        if (actorData.type === "Player") {
//        	data.physical.base= data.attributes["bod"]/2 + 8; // ToDo: Aufrunden
//        	data.derivedAttributes.initiative = {};
//            data.derivedAttributes.initiative.value = 17;  // Irgendwas zum testen
//        }

    }

    //---------------------------------------------------------
    /*
     * Calculate the final attribute values
     */
    _prepareSkills() {
    	const actorData = this.data;
        const data =  this.data.data;
        console.log("PrepareSkills");
        // Only calculate for PCs - ignore for NPCs/Critter
        if (actorData.type === "Player") {
        	actorData.items.forEach(tmpItem => {
        		console.log("owned item = "+tmpItem);
        		let item = tmpItem.data;
        		if (item.type == "skill-value" && item.data.id!="knowledge" && item.data.id!="language") {
        			try {
        				let skillDef = CONFIG.SR6.ATTRIB_BY_SKILL.get(item.data.id);
        				if (!skillDef) {
        					console.log("No skill definition for "+skillDef);
        				}
        				let attr = skillDef.attrib;
        				let attribVal =  data.attributes[attr].pool;
        				item.data.pool = attribVal + item.data.points;
        				item.update({"data.pool": item.data.pool});
        			} catch (e) {
        				console.log("Error for skill "+item.data.id+": "+e);
        			}
        		};
        	});
//        	
//            CONFIG.SR6.ATTRIB_BY_SKILL.forEach(skill => {
//            	let sVal = new Item();
//            	sVal.type = "skill-value";
//            	sVal.data.id = skill;
//            });
        }
    }

    /**
     * Roll a Skill Check
     * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
     * @param {string} skillId      The skill id (e.g. "ins")
     * @param {Object} options      Options which configure how the skill check is rolled
     * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
     */
    rollSkill(skillId, options = {}) {
    	let skl = "";
    	this.items.forEach(loopItem => {
    		let item = loopItem.data;
    		if (item.type == "skill-value") {
    			console.log("Is it "+item.data);
    			if (item.data.id==skillId) {
    				console.log("Found "+skillId+" with "+item.data.id);
    				skl = item.data;
    			}
    		}
    	});
        //const skl = this.data.i.skills[skillId];
    	//const skl = this.getOwnedItem(itemID);
        const value = skl.pool;
        const parts = [];


        // Roll and return
        let data = mergeObject(options, {
            parts: parts,
            value: value,
            title: skl.name,
            skill: skl
        });
        data.speaker = ChatMessage.getSpeaker({ actor: this });
        return doRoll(data);
    }

}
