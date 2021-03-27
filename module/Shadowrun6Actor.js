import { doRoll } from "../module/dice/dice.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Shadowrun6Actor extends Actor {
    /** @Override */
    prepareData() {
        super.prepareData();
        console.log("hallo Welt!");
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
