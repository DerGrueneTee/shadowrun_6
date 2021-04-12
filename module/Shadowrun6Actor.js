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
         
        if (actorData.type === "Player") {
             data.physical.max = 8 + Math.round(data.attributes["bod"].pool/2) + data.physical.mod; 
             data.stun.max     = 8 + Math.round(data.attributes["wil"].pool/2) + data.stun.mod;
             
             console.log("Set Physical to "+data.physical.max);
       }

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
        			} catch (e) {
        				console.log("Error for skill "+item.data.id+": "+e);
        			}
        		};
        	});
        	
            CONFIG.SR6.ATTRIB_BY_SKILL.forEach(function(skillDef,id) {
				let attr = skillDef.attrib;
				let attribVal =  data.attributes[attr].pool;
				data.skills[id].pool = attribVal + data.skills[id].points;
            });
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
            title: game.i18n.localize("skill."+skillId),
            skill: skl
        });
        data.speaker = ChatMessage.getSpeaker({ actor: this });
        return doRoll(data);
    }

}
