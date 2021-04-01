import { doRoll } from "../module/dice/dice.js";

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
                data.attributes[attr].current =
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
        	data.physical.base= data.attributes["bod"]/2 + 8; // ToDo: Aufrunden
        	data.derivedAttributes.initiative = {};
            data.derivedAttributes.initiative.value = 17;  // Irgendwas zum testen
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
        const skl = this.data.data.skills[skillId];
        const value = skl.value
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
