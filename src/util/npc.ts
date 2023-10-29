function skill_to_skill_id(skill: string): string {

    skill = skill.toLowerCase();
    let SKILL_MAP: any = (<Game>game).i18n.translations.skill;
    for (const id in SKILL_MAP) {
        if (SKILL_MAP[id].toLowerCase() == skill) {
            return id;
        }
    }

    throw new Error("Skill not found: " + skill);
}


function spec_to_spec_id(skill: string | null, spec: string): string | undefined {
    spec = spec.toLowerCase();
    let SPECIALIZATION_MAP: any = (<any>game).i18n.translations.shadowrun6.special;

    if (skill != null) {
        for (const id in SPECIALIZATION_MAP[skill]) {
            for (const spec_id in SPECIALIZATION_MAP[skill]) {
                if (SPECIALIZATION_MAP[skill][spec_id].toLowerCase() == spec) {
                    return spec_id;
                }
            }
        }
    } else {
        for (const skill in SPECIALIZATION_MAP) {
            for (const id in SPECIALIZATION_MAP[skill]) {
                for (const spec_id in SPECIALIZATION_MAP[skill]) {
                    if (SPECIALIZATION_MAP[skill][spec_id].toLowerCase() == spec) {
                        return spec_id;
                    }
                }
            }
        }

    }
    return undefined;
}

function pool_to_skill_lvl(attrs: Attributes, skill: string, pool: number): number {
    switch (skill) {
        case "astral": { return pool - attrs.intuition.pool(); }
        case "athletics": { return pool - attrs.agility.pool(); }
        case "biotech": { return pool - attrs.logic.pool(); }
        case "close_combat": { return pool - attrs.agility.pool(); }
        case "con": { return pool - attrs.charisma.pool(); }
        case "conjuring": { return pool - (attrs.special?.pool() || 0); }
        case "cracking": { return pool - attrs.logic.pool(); }
        case "electronics": { return pool - attrs.logic.pool(); }
        case "enchanting": { return pool - (attrs.special?.pool() || 0); }
        case "engineering": { return pool - attrs.logic.pool(); }
        case "exotic_weapons waffen": { return pool - attrs.agility.pool(); }
        case "firearms": { return pool - attrs.agility.pool(); }
        case "influence": { return pool - attrs.charisma.pool(); }
        case "outdoors": { return pool - attrs.intuition.pool(); }
        case "perception": { return pool - attrs.intuition.pool(); }
        case "piloting": { return pool - attrs.reaction.pool(); }
        case "sorcery": { return pool - (attrs.special?.pool() || 0); }
        case "stealth": { return pool - attrs.agility.pool(); }
        case "tasking": { return pool - (attrs.special?.pool() || 0); }
    };
    return pool;
}


enum SectionType {
    None,
    Meta,
    Stats,
    DRStats,
    StatsWithMagic,
    StatsWithResonance,
    StatsAlternate,
    Status,
    Initiative,
    Actions,
    Defense,
    Skills,
    SkillsPooled,
    Equipment,
    Cyberware,
    Weapons,
    Spells,
    Vehicles,
    AdeptPowers,
    AstralInitiative,
    ComplexForms,
    MetaMagic,
    Initiation,
    Languages,
    Persona,
    Power,
    Age,
    Influence,
    Programs,
    Description

}

const STATS_LINES: string[] = ["K G R S W L I C ESS", "K G R S W L I C EDG ESS", "B A R S W L I C ESS", "CON AGI RÉA FOR VOL LOG INT CHA ESS"];
const ALTERNATE_STATS_LNIE: string[] = ["K", "B"]
const STATS_MAGIC_LINES: string[] = ["K G R S W L I C M ESS", "K G R S W L I C EDG M ESS", "B A R S W L I C M ESS", "CON AGI RÉA FOR VOL LOG INT CHA MAG ESS"];
const STATS_RES_LINES: string[] = ["K G R S W L I C RES ESS", "K G R S W L I C EDG R ESS", "B A R S W L I C RS ESS", "CON AGI RÉA FOR VOL LOG INT CHA RES ESS"];
const DR_LINES: string[] = ["DR I/ID AC CM MOVE","I/ID AC CM MOVE", "SD I/DI PA ME DÉPLACEMENT", "SD I/DI PA ME DÉPLACEMENT DRAIN", "SD I/DI PA ME DÉPLA. DRAIN", "SD I/DI PA ME DÉPLA.", "SD I/DI PA ME DÉPLA. TECHNO."]; // the french books are inconsistent
const INIT_LINES: string[] = ["Initiative:"]; // DE specific
const INIT_ASTRAL_LINES: string[] = ["Astrale Initiative:"]; // DE specific
const ACTIONS_LINE: string[] = ["Handlungen:"]; // DE specific
const STATUS_LINES: string[] = ["Zustandsmonitor:"]; // DE specific
const DEFENSE_LINES: string[] = ["Verteidigungswert:"]; // DE specific
const SKILLS_LINES: string[] = ["Fertigkeiten:", "Skills:", "Compétences :"];
const SKILLS_POOLED_LINES: string[] = ["Fertigkeiten (Würfelpools):"]; // DE specific extra books
const LANG_LINES: string[] = ["Sprachfertigkeiten:"]; // DE specific extra books
const GEAR_LINES: string[] = ["Ausrüstung:", "Gear:", "Équipement :"];
const CYBERWARE_LINES: string[] = ["Bodytech:", "Augmentations:", "Augmentations :", "Augmentations (alphaware) :"]; // FR specific alphaware
const WEAPON_LINES: string[] = ["Waffen:", "Weapons:", "Armes :"];
const SPELLS_LINES: string[] = ["Zauber:", "Spells:", "Sorts :"];
const VEHICLES_LINES: string[] = ["Fahrzeuge und Drohnen:", "Vehicles and Drones:", "Véhicules et drones :"];
const ADEPT_POWERS_LINES: string[] = ["Adeptenkräfte:", "Powers:", "Pouvoirs d’adepte :"];
const COMPLEX_FORMS_LINES: string[] = ["Komplexe Formen:", "Complex Forms:", "Formes complexes :"];
const METAMAGIC_LINES: string[] = ["Metamagie:", "Metamagics:", "Métamagies :"];
const INITIATION_LINES: string[] = ["Initiatengrad:", "Initiate Grade:", "Grade d’initié :"];
const PROGRAMS_LINES: string[] = ["Programme:", "Programs:"]; // FR rolls this into equipment
const PERSONA_LINES: string[] = ["Lebende Persona:"]; // DE specific
const POWERS_LINES: string[] = ["Kräfte:"]; // DE specific
const AGE_LINES: string[] = ["Alter"]; // DE specific extra books
const INFLUENCE_LINES: string[] = ["Einflussstufe"]; // DE specific extra books
const DESC_LINES: string[] = ["Bevorzugte Zahlungsmethode"]; // DE specific extra books

function isSectionStart(line: string): SectionType {
    if (line.match(/^(.*?\s+)?(Mensch|Zwerg|Ork|Troll|Elfe|Elf|Drache|Drachin|Geist)(in)?$/)) {
        return SectionType.Meta
    } else if (ALTERNATE_STATS_LNIE.find((l) => line == l)) {  // Note we check for equality here since this is an alternate table representation
        return SectionType.StatsAlternate
    } else if (STATS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Stats
    } else if (STATS_MAGIC_LINES.find((l) => line.startsWith(l))) {
        return SectionType.StatsWithMagic
    } else if (STATS_RES_LINES.find((l) => line.startsWith(l))) {
        return SectionType.StatsWithResonance
    } else if (DR_LINES.find((l) => line.startsWith(l))) {
        return SectionType.DRStats
    } else if (INIT_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Initiative
    } else if (INIT_ASTRAL_LINES.find((l) => line.startsWith(l))) {
        return SectionType.AstralInitiative
    } else if (ACTIONS_LINE.find((l) => line.startsWith(l))) {
        return SectionType.Actions
    } else if (STATUS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Status
    } else if (DEFENSE_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Defense
    } else if (SKILLS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Skills
    } else if (SKILLS_POOLED_LINES.find((l) => line.startsWith(l))) {
        return SectionType.SkillsPooled
    } else if (LANG_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Languages
    } else if (GEAR_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Equipment
    } else if (CYBERWARE_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Cyberware
    } else if (PROGRAMS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Programs
    } else if (WEAPON_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Weapons
    } else if (SPELLS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Spells
    } else if (VEHICLES_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Vehicles
    } else if (ADEPT_POWERS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.AdeptPowers
    } else if (COMPLEX_FORMS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.ComplexForms
    } else if (METAMAGIC_LINES.find((l) => line.startsWith(l))) {
        return SectionType.MetaMagic
    } else if (INITIATION_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Initiation
    } else if (PERSONA_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Persona
    } else if (POWERS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Power
    } else if (AGE_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Age;
    } else if (INFLUENCE_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Influence;
    } else if (DESC_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Description;
    } else {
        return SectionType.None
    }
}

function nextSection(lines: string[], i: number): Section {
    let type = isSectionStart(lines[i]);
    let content = "";
    if (type == SectionType.Meta || type == SectionType.Age || type == SectionType.StatsAlternate) {
        content = lines[i].trim();
    } else if (type == SectionType.Description) {
        content = lines[i] + "\n";
    } else if (type != SectionType.Stats && type != SectionType.StatsWithMagic && type != SectionType.StatsWithResonance && type != SectionType.DRStats) {
        content = lines[i].split(":", 2)[1].trim();
    }
    i++;
    while (i < lines.length && isSectionStart(lines[i]) == SectionType.None) {
        if (type == SectionType.Description) {
            content += lines[i] + "\n";
        } else {
            content += " " + lines[i].trim();
        }
        i++;
    }
    if (type == SectionType.StatsAlternate) {
        let header = content.replace(/[^A-Z]+/g, " ").replace(/\s+/g, " ").trim();
        content = content.replace(/[A-Z]+/g, " ").replace(/\s+/g, " ").trim();
        if (STATS_LINES.find((l) => header.startsWith(l))) {
            type = SectionType.Stats
        } else if (STATS_MAGIC_LINES.find((l) => header.startsWith(l))) {
            type = SectionType.StatsWithMagic
        } else if (STATS_RES_LINES.find((l) => header.startsWith(l))) {
            type = SectionType.StatsWithResonance
        } else {
            throw new Error("Invalid stats line: " + header);
        }
    }
    return new Section(type, i, content.trim());
}

class Skill {
    public id: string;
    public value: number;
    public modified_value: number;
    public specialization?: string;
    public specialisation_value?: number;
    public expertise?: string;
    public expertise_value?: number;
    constructor(def: string, attrs: Attributes | undefined) {
        //                         1     2         3             4       5          6       7
        let matches = def.match(/(.*?) (\d+)(?:\((\d+)\))?(?: \((.*?) \+(\d+)(?:, (.*?) \+(\d+))?\))?/);
        if (matches != null) {
            this.id = skill_to_skill_id(matches[1]);
            this.value = parseInt(matches[2]);
            this.modified_value = this.value;
            if (matches[3] != null) {
                this.modified_value = parseInt(matches[3]);
            };
            if (matches[4] != null) {
                this.specialization = spec_to_spec_id(this.id, matches[4]);
            }
            if (matches[5] != null) {
                this.specialisation_value = parseInt(matches[5]);
            }
            if (matches[6] != null) {
                this.specialization = spec_to_spec_id(this.id, matches[6]);
            }
            if (matches[7] != null) {
                this.expertise_value = parseInt(matches[7]);
            }

            if (attrs) {
                this.value = pool_to_skill_lvl(attrs, this.id, this.value);
                this.modified_value = pool_to_skill_lvl(attrs, this.id, this.modified_value);

            }
            return this;
        } else {
            throw new Error("Invalid skill: " + def);

        }
    }
    /**
     * to_vtt
     */
    public to_vtt(attrs: Attributes): any {
        let res: any = {
            "points": this.value,
            "augment": 0
        };
        if (this.modified_value) {
            res.modifier = this.modified_value - this.value;
        }

        if (this.specialization) {
            res.specialization = this.specialization;
        }
        if (this.expertise) {
            res.expertise = this.specialization;
        }
        return res;
    }
}

export class Attibute {
    public value: number;
    public modified_value?: number;
    public adjustment?: number;
    constructor(def: string) {
        let matches = def.match(/([\d,.]+)(?:\(([+]?)(\d+)\))?/);
        if (matches != null) {
            this.value = parseFloat(matches[1].replace(",", "."));
            if (matches[2] == "+" && matches[3] != null) {
                this.adjustment = parseInt(matches[3]);
            } else if (matches[3] != null) {
                this.modified_value = parseInt(matches[3]);
            }
        } else {
            throw new Error("Invalid attribute: " + def);
        }
    }
    /**
     * to_vtt
     */
    public to_vtt() {
        return {
            "base": this.value,
            "mod": this.pool() - this.value,
            "pool": this.pool(),
            "modString": this.adjustment ? this.adjustment.toString() : ""
        }
    }

    /**
     * pool
     */
    public pool(): number {
        return this.modified_value || this.value
    }
}

class Attributes {
    public constitution: Attibute;
    public agility: Attibute;
    public reaction: Attibute;
    public strength: Attibute;
    public willpower: Attibute;
    public logic: Attibute;
    public intuition: Attibute;
    public charisma: Attibute;
    public essence: Attibute;
    public special: Attibute | undefined;
    public edge: Attibute | undefined;
    constructor(def: string, has_special: boolean = false) {
        def = def.replace(/\s+\(/g, "(")
        let parts = def.split(" ").map(def => {
            return new Attibute(def)
        });
        if (parts.length >= 9) {
            this.constitution = parts[0];
            this.agility = parts[1];
            this.reaction = parts[2];
            this.strength = parts[3];
            this.willpower = parts[4];
            this.logic = parts[5];
            this.intuition = parts[6];
            this.charisma = parts[7];
            if (parts.length == 9 && !has_special) {
                this.essence = parts[8];
            } else if (parts.length == 10 && !has_special) {
                this.edge = parts[8];
                this.essence = parts[9];
            } else if (parts.length == 10) {
                this.special = parts[8];
                this.essence = parts[9];
            } else if (parts.length == 11 && has_special) {
                this.edge = parts[8];
                this.special = parts[9];
                this.essence = parts[10];
            } else {
                throw new Error("Invalid attributes: " + def);
            }
        } else {
            throw new Error("Invalid attributes: " + def);
        }
    }
    /*
     * to_vtt
     */
    public to_vtt(mortype: Special): any {
        let res: any = {
            "bod": this.constitution.to_vtt(),
            "agi": this.agility.to_vtt(),
            "rea": this.reaction.to_vtt(),
            "str": this.strength.to_vtt(),
            "wil": this.willpower.to_vtt(),
            "log": this.logic.to_vtt(),
            "int": this.intuition.to_vtt(),
            "cha": this.charisma.to_vtt(),
        };
        switch (mortype) {
            case Special.Magic: {
                res["mag"] = this.special?.to_vtt();
                break;
            }
            case Special.Resonance: {
                res["res"] = this.special?.to_vtt();
                break;
            }
        }
        return res;
    }
}

class Cyberware {
    public level: number | undefined;
    public mods: string[] | undefined;
    public name: string;
    constructor(
        def: string,
    ) {
        def = def.trim();
        let matches = def.trim().match(/(.+?)\s*\[Stufe (\d+?)\],?/);
        if (matches != null) {
            this.name = matches[1];
            this.level = parseInt(matches[2]);
            return this;
        }

        matches = def.match(/(.+?)\s*\[Stufe (\d+?);(.*)\],?/);
        if (matches != null) {
            this.name = matches[1];
            this.level = parseInt(matches[2]);
            this.mods = matches[3].split(",").map(x => x.trim());
            return this;
        }
        matches = def.match(/(.+?)\s*\[(.+?)\],?/);
        if (matches != null) {
            this.name = matches[1];
            this.mods = matches[2].split(",").map(x => x.trim());
            return this;
        }
        matches = def.trim().match(/(.+?)\s+(\d+?),?/);
        if (matches != null) {
            this.name = matches[1];
            this.level = parseInt(matches[2]);
            return this;
        }
        this.name = def.replace(/,$/, "");
    }

    /**
     * to_vtt
     */
    public to_vtt() {
        return {
            "name": this.name,
            "type": "gear",
            "data": {
                "type": "CYBERWARE",
                "accessories": this.mods?.join(", ") || "",

            },
        }
    }
}

class Item {
    public mods: string[] | undefined;
    public name: string
    constructor(
        def: string,
    ) {
        def = def.trim();
        let matches = def.match(/(.+?)\s*\[(.+?)\],?/);
        if (matches != null) {
            this.name = matches[1];
            this.mods = matches[2].split(/[,;]/).map(x => x.trim());
            return this;
        }
        this.name = def.replace(/,$/, "");
    }

    /**
     * to_vtt
     */
    public to_vtt() {
        return this.guess_type({
            "name": this.name,
            "type": "gear",
            "data": {
                "accessories": this.mods?.join(", ") || "",
            },
            "effects": []
        });
    }

    // Some minimal heuristics to group the items
    private guess_type(res: any): any {
        if (this.name.match(/kommlink|commlink/i)) {
            res.data.type = "ELECTRONICS";
            res.data.subtype = "COMMLINK";
        } else if (this.name.match(/deck/i)) {
            res.data.type = "ELECTRONICS";
            res.data.subtype = "CYBERDECK";
        } else if (this.name.match(/panzer|armor/i)) {
            res.data.type = "ARMOR";
            res.data.subtype = "ARMOR_BODY";
        } else if (this.name.match(/helm|helmet/i)) {
            res.data.type = "ARMOR";
            res.data.subtype = "ARMOR_HELMET";
        }
        return res

    }
}

const WEAPON_MAPPING: any = {
    "Waffenlos": "waffenloser kampf",
    "Wurfwaffe": "werfen",
    "Gewehr": "gewehre",
    "Granate": "werfen",
}
class Weapon {
    public type: string;
    public damage: number | string;
    public damage_type: string | undefined;
    public modi: string[] = [];
    public attack_value: number[] = [0, 0, 0, 0, 0];
    public ammo?: number;
    public mods: string[] = [];
    public detonation_range?: number;
    constructor(public name: string, attrs: string) {
        //  Fix possible issue with words being split by `-`
        attrs = attrs.replace(/([A-Za-z]+)-\s*([a-z]+)/, "$1$2")
        let data = attrs.split(/[|,]/).map(x => x.trim());
        this.type = data[0];
        // FIXME internationalize
        let damage = data[1].match(/(?:Schaden|DV) (\d+)(.*)/);
        if (damage == null) {
            this.damage = data[1];
        } else {
            this.damage = parseInt(damage[1]);
            this.damage_type = damage[2];
        }
        let i = 2;
        if (data[i] == null) {
            return
        }
        // FIXME internationalize
        let detonation_range1 = data[i].match(/(:?Sprengwirkung|Blast) (\d+).*/);
        if (detonation_range1 !== null) {
            this.detonation_range = parseInt(detonation_range1[1]);
            i++;
        }
        if (data[i] == null) {
            return
        }
        if (!data[i].startsWith("Angriffswerte")) {
            this.modi = data[i].split("/").map(x => x.trim());
            i++;
        }
        if (data[i] == null) {
            return
        }
        // FIXME internationalize
        let attack_value = data[i].match(/(?:(?:Angriffswerte|Attack Ratings) )?(.+)/);
        if (attack_value !== null) {
            this.attack_value = attack_value[1].split("/").map(x => {
                if (x == "-") {
                    return 0
                } else {
                    return parseInt(x) || 0
                }
            });
            while (this.attack_value.length < 5) {
                this.attack_value.push(0)
            }
            i++;
        }
        if (data[i] == null) {
            return
        }
        // FIXME internationalize
        let detonation_range = data[i].match(/Sprengwirkung (\d+).*/);
        if (detonation_range !== null) {
            this.detonation_range = parseInt(detonation_range[1]);
            i++;
        }
    }

    private skill(): string | undefined {
        // we need this to avoiud recursiuon
        const mapping: any = {
            "blades": "close_combat",
            "clubs": "close_combat",
            "unarmed": "close_combat",
            "gunnery": "engineering",
            "assault_cannons": "firearms",
            "holdouts": "firearms",
            "machine_pistols": "firearms",
            "pistols_heavy": "firearms",
            "pistols_light": "firearms",
            "rifles": "firearms",
            "shotguns": "firearms",
            "submachine_guns": "firearms",
            "tasers": "firearms",
            "whips": "firearms",
            "archery": "athletics",
            "throwing": "athletics"
        }
        // FIXME
        let spec_id = this.spec();
        if (spec_id == null) {
            return undefined
        } else {
            return mapping[spec_id]
        }
    }

    private item_type(): string {
        let skill = this.skill();
        if (skill == null) {
            return "WEAPON_RANGED"
        } else {
            return "WEAPON_" + skill.toUpperCase()
        }
    }

    private item_subtype(): string {
        let spec = this.spec();
        if (spec == null) {
            return "THROWING"
        } else {
            return spec.toUpperCase()
        }
    }

    private spec(): string | undefined {
        // Check for normal sigular and plural forms as well
        return spec_to_spec_id(null, WEAPON_MAPPING[this.type] || this.type) ||
            spec_to_spec_id(null, this.type + "n") || spec_to_spec_id(null, this.type + "s")


    }
    private accessories(): string {
        return this.mods.join(", ")
    }
    /**
     * to_vtt
     */
    public to_vtt(): any {
        return {
            "name": this.name,
            "type": "gear",
            "data": {
                "dmgDef": this.damage.toString() + this.damage_type,
                "dmg": this.damage,
                "stun": this.damage_type != "S",
                "attackRating": this.attack_value,
                "modes": {
                    "BF": this.modi.includes("BF"),
                    "FA": this.modi.includes("FA"),
                    "SA": this.modi.includes("SA"),
                    "SS": this.modi.includes("SS"),
                },
                "type": this.item_type(),
                "subtype": this.item_subtype(),
                "skill": this.skill(),
                "skillSpec": this.spec(),
                "accessories": this.accessories(),
            },
            "effects": []
        }
    }
}

class Spell {
    constructor(public name: string) {
    }
    /**
     * to_vtt
     */
    public to_vtt(): any {
        return {
            "name": this.name,
            "type": "spell",
        }
    }
}

class Program {
    constructor(public name: string) {
    }
    /**
     * to_vtt
     */
    public to_vtt(): any {
        return {
            "name": this.name,
            "type": "gear",
            "data": {
                // FIXME: we don't have a type/subtype for programs
                "type": "ELECTRONICS",
                "subtype": "ELECTRONIC_ACCESSORIES",
            }
        }
    }
}
class Vehicles {
    constructor(public name: string) {
    }
}
class AdeptPower {
    constructor(public name: string) {
    }

    /**
     * to_vtt
     */
    public to_vtt(): any {
        return {
            "name": this.name,
            "type": "quality",
            "data": {
                "category": "ADEPT_WAY",
                "level": false,
                "value": 1,
                "modifier": []
            },
            "effects": []
        }
    }
}

class ComplexForm {
    constructor(public name: string) {
    }
}

class MetaMagic {
    constructor(public name: string) {
    }
}


class Language {
    constructor(public name: string) {
    }
    /**
     * to_vtt
     */
    public to_vtt(): any {
        return {
            "name": this.name,
            "type": "skill",
            "data": {
                "genesisID": "language",
                "points": 1,
                "modifier": 0
            },
            "effects": []
        }
    }
}

class Persona {
    constructor(public name: string) {
    }
    /**
     * to_vtt
     */
    public to_vtt(): any {
        // FIXME
        return {
            "device": {
                "mod": {
                    "a": null,
                    "s": null,
                    "d": null,
                    "f": null
                }
            }
        };

    }
}

class Power {
    constructor(public name: string) {
    }
}

class MetaType {
    constructor(public name: string) {
    }
}

class Status {
    public body: number;
    public will: number;
    constructor(def: string) {
        let matches = def.match(/(\d+)(?:\/(\d+))?/);
        if (matches != null) {
            this.body = parseInt(matches[1]);
            if (matches[2] != null) {
                this.will = parseInt(matches[2]);
            } else {
                this.will = this.body
            }
        } else {
            throw new Error("Could not parse status: " + def)
        }
    }
}

class Initiative {
    public initiative: number;
    public die?: number;
    constructor(def: string) {
        let matches = def.match(/^(\d+)\s+[+]\s+(\d+)[WwDd]6/);
        if (matches == null) {
            this.initiative = parseInt(def);
        } else if (matches.length == 3) {
            this.initiative = parseInt(matches[1]);
            this.die = parseInt(matches[2]);
        } else {
            throw new Error("Invalid Initiative: " + def);
        }

    }
    /**
     * to_vtt
     */
    public to_vtt(base: number) {
        return {
            "mod": this.initiative - base,
            "dice": this.die || 0
        }
    }
}
enum Special {
    None,
    Magic,
    Resonance
}

class Section {
    constructor(
        public type: SectionType,
        public end: number,
        public content: string,
    ) { }
}

export class NPC {
    public name: string;
    public meta_type?: MetaType;
    public age?: number;
    public size?: number;
    public weight?: number;
    public influence?: number;
    public desc?: string;
    public attributes: Attributes;
    public special: Special = Special.None;
    public initiative: Initiative = new Initiative("0");
    public astralInitiative?: Initiative;
    public status: Status = new Status("0");
    public defense: number = 0;
    public skills: Skill[] = [];
    public powers?: Power[];
    public languageskills?: Language[];
    public persona?: Persona;
    public complexForms?: ComplexForm[];
    public initiation?: number;
    public metaMagic?: MetaMagic[];
    public adeptPowers?: AdeptPower[];
    public spells?: Spell[];
    public bodytech?: Cyberware[];
    public items: Item[] = [];
    public vehicles?: Vehicles[] = [];
    public programs?: Program[];
    public weapons: Weapon[] = [];
    constructor(
        data: string,
    ) {
        let lines = data.trim().split("\n");
        this.name = lines[0];
        let i = 1;
        while (i < lines.length && isSectionStart(lines[i]) == SectionType.None) {
            this.name += " " + lines[i].trim();
            i++;
        }
        while (i < lines.length) {
            let section = nextSection(lines, i);
            i = section.end;
            switch (section.type) {
                case SectionType.Meta: {
                    this.meta_type = new MetaType(section.content);
                    break;
                }
                case SectionType.Age: {
                    let matcehs = section.content.match(/^Alter: (\d+)\s+Größe\/Gewicht: ([\d,]+) m\/(\d+) kg$/);
                    if (matcehs != null) {
                        this.age = parseInt(matcehs[1]);
                        this.size = parseFloat(matcehs[2].replace(",", "."));
                        this.weight = parseInt(matcehs[3]);
                    } else {
                        this.age = parseInt(section.content);
                    }
                    break;
                }
                case SectionType.Influence: {
                    this.influence = parseInt(section.content);
                    break;
                }
                case SectionType.Description: {
                    this.desc = section.content;
                    break;
                }
                case SectionType.StatsWithMagic: {
                    this.special = Special.Magic;
                    this.attributes = new Attributes(section.content, true);
                    break;
                }
                case SectionType.StatsWithResonance: {
                    this.special = Special.Resonance;
                    this.attributes = new Attributes(section.content, true);
                    break;
                }
                case SectionType.Stats: {
                    this.attributes = new Attributes(section.content, false);
                    break;
                }
                case SectionType.DRStats: {
                    //                                       1        2           3      4                      5         6        8     9
                    //                                       2     (  7   )       4   /  1     A1  ,   I2       9       / 9       10  / 15   /+  1
                    let matches_en = section.content.match(/(\d+)(?:\((\d*)\))?\s+(\d+)\/(\d+)\s+A\d+,\s*I\d+\s+(\d+)(?:(\/\d+))?\s+\d+\/\d+\/\+\d+/)
                    //                                        1      2                      3         4        8     9
                    //                                        4   /  1     A1  ,   I2       9       / 9       10  / 15   /+  1
                    let matches_enCritter = section.content.match(/(\d+)\/(\d+)\s+A\d+,\s*I\d+\s+(\d+)(?:(\/\d+))?\s+\d+\/\d+\/\+\d+/)
                    // 9 12/1 (physique) 10/2 (astrale) MAJ 1, MIN 2 (physique) MAJ 1, MIN 3 (astrale) 11 10/15/+1 12
                    let matches_fr = section.content.match(/^(\d+)\s+(\d+)\/(\d+)(?:\s*\([^)]+\))?(?:\s*[^\/]+?\/.+?\s*\([^)]+\))*\s+MAJ\s+\d+,\s*MIN\s+\d+(?:\s*\([^)]+\))?(?:\s*MAJ\s*\d+,\s*MIN\s*\d+\s*\([^)]+\))*\s+(\d+)(?:\s+\([^)]+\))?(?:\s+\d+\s+\([^)]+\))*\s+\d+\/\s*\d+\/\s*\+\d(?:\s+\d+)?$/)

                    if (matches_en) {
                        console.log("Test 1");
                        this.defense = parseInt(matches_en[2]) || parseInt(matches_en[1]) || 0;
                        // This is a bit of a cheat)
                        this.initiative = new Initiative(matches_en[3] + " + " + matches_en[4] + "W6");
                        this.status = new Status(matches_en[5]);
                    } else if (matches_enCritter) {
                        console.log("Test 2");
                        this.defense = 0;
                        // This is a bit of a cheat
                        this.initiative = new Initiative(matches_enCritter[1] + " + " + matches_enCritter[2] + "W6");
                        this.status = new Status(matches_enCritter[3]);
                    } else if (matches_fr) {
                        this.defense = parseInt(matches_fr[1]);
                        // This is a bit of a cheat
                        this.initiative = new Initiative(matches_fr[2] + " + " + matches_fr[3] + "W6");
                        this.status = new Status(matches_fr[4]);
                    } else {
                        throw new Error("Could not parse DR stats: " + section.content);
                    }
                    break;
                }
                case SectionType.Status: {
                    this.status = new Status(section.content);
                    break;
                }
                case SectionType.Initiation: {
                    this.initiation = parseInt(section.content);
                    break;
                }
                case SectionType.Initiative: {
                    this.initiative = new Initiative(section.content);
                    break;
                }
                case SectionType.AstralInitiative: {
                    this.astralInitiative = new Initiative(section.content);
                    break;
                }
                case SectionType.Defense: {
                    this.defense = parseInt(section.content);
                    break;
                }
                case SectionType.SkillsPooled:
                case SectionType.Skills: {
                    let attributes = (section.type == SectionType.SkillsPooled) ? this.attributes : undefined;
                    let j = 0;
                    let in_brackets = false;
                    let skill = "";
                    while (j < section.content.length) {
                        switch (section.content[j]) {
                            case "(": {
                                in_brackets = true;
                                break;
                            }
                            case ")": {
                                in_brackets = false;
                                break;
                            }
                            case ",": {
                                if (!in_brackets) {
                                    this.skills.push(new Skill(skill.trim(), attributes));
                                    skill = "";
                                    j++;
                                }
                                break;
                            }
                        }
                        skill += section.content[j];
                        j++;
                    }
                    this.skills.push(new Skill(skill.trim(), attributes));
                    break;
                }
                case SectionType.Languages: {
                    this.languageskills = section.content.split(",").map(x => x.trim()).map(x => new Language(x));
                    break;
                }
                case SectionType.Equipment: {
                    let j = 0;
                    let in_brackets = false;
                    let item = "";
                    while (j < section.content.length) {
                        switch (section.content[j]) {
                            case "[": {
                                in_brackets = true;
                                break;
                            }
                            case "]": {
                                in_brackets = false;
                                break;
                            }
                            case ",": {
                                if (!in_brackets) {
                                    this.items.push(new Item(item.trim()));
                                    item = "";
                                    j++;
                                }
                                break;
                            }
                        }
                        item += section.content[j];
                        j++;
                    }
                    this.items.push(new Item(item.trim()));
                    break;
                }
                case SectionType.Cyberware: {
                    let matches = section.content.match(/\s*.+?(?:\[.*?\])?(?:,|$)/g);
                    if (matches !== null) {
                        this.bodytech = matches.map(x => new Cyberware(x.trim()));
                    } else {
                        throw new Error("Invalid bodytech: " + section.content);
                    }
                    break;
                }
                case SectionType.Weapons: {
                    let j = 0;
                    let in_brackets = false;
                    let expected_close = "]";
                    let name = "";
                    let attrs = "";
                    while (j < section.content.length) {
                        let c = section.content[j];
                        switch (c) {
                            case "[": {
                                if (!in_brackets) {
                                    expected_close = "]";
                                }
                                in_brackets = true;
                                j++;
                                continue;
                            }
                            case "(": {
                                if (!in_brackets) {
                                    expected_close = ")";
                                }
                                in_brackets = true;
                                j++;
                                continue;
                            }
                            case ")":
                            case "]": {
                                if (in_brackets && c == expected_close) {
                                    in_brackets = false;
                                    this.weapons.push(new Weapon(name, attrs));
                                    name = "";
                                    attrs = "";
                                }
                                j++;
                                continue;
                            }
                        }
                        if (in_brackets) {
                            attrs += c;
                        } else {
                            name += c;
                        }
                        j++;
                    }
                    break;
                }
                case SectionType.Spells: {
                    this.spells = section.content.split(",").map(x => new Spell(x.trim()));
                    break;
                }
                case SectionType.Vehicles: {
                    this.vehicles = section.content.split(",").map(x => new Vehicles(x.trim()));
                    break;
                }
                case SectionType.AdeptPowers: {
                    this.adeptPowers = section.content.split(",").map(x => new AdeptPower(x.trim()));
                    break;
                }
                case SectionType.Programs: {
                    this.programs = section.content.split(",").map(x => new Program(x.trim()));
                    break;
                }
                case SectionType.ComplexForms: {
                    this.complexForms = section.content.split(",").map(x => new ComplexForm(x.trim()));
                    break;
                }
                case SectionType.MetaMagic: {
                    this.metaMagic = section.content.split(",").map(x => new MetaMagic(x.trim()));
                    break;
                }
                case SectionType.Persona: {
                    this.persona = new Persona(section.content);
                    break;
                }
                case SectionType.Power: {
                    this.powers = section.content.split(",").map(x => new Power(x.trim()));
                    break;
                }
            }
        }
        if (!this.attributes) {
            throw new Error("Invalid stats block");
        }
    }


    private skills_to_vtt() {
        let skills: any = {};
        for (let skill of this.skills) {
            skills[skill.id] = skill.to_vtt(this.attributes);
        }
        return skills;

    }
    private defenserating(): any {
        return {}
    }
    private mortype(): string {
        switch (this.special) {
            case Special.Magic:
                if (this.spells != undefined && this.adeptPowers != undefined) {
                    return "mysticadept"
                } else if (this.adeptPowers != undefined) {
                    return "adept";
                } else {
                    return "magician";
                }
            case Special.Resonance:
                return "technomancer";
            default:
                return "mundane";
        }
    }
    /**
     * to_vtt
     */
    public to_vtt(): any {
        let physical = {
            "base": this.status.body,
            "value": this.status.body,
        };
        let stun = {
            "base": this.status.will,
            "value": this.status.will,
        };
        let edge = {
            "value": this.attributes.edge || 0,
            "max": this.attributes.edge || 0,
        };
        let initiative: any = {
            "physical": this.initiative.to_vtt(this.attributes.reaction.pool() + this.attributes.intuition.pool()),
        };
        if (this.astralInitiative && this.attributes.special) {
            initiative.astral = this.astralInitiative.to_vtt(this.attributes.special.pool());
        }
        let data = {
            "attributes": this.attributes.to_vtt(this.special),
            "metatype": this.meta_type,
            "gender": "",
            "physical": physical,
            "stun": stun,
            "edge": edge,
            "defenserating": this.defenserating(),
            "initiative": initiative,
            "skills": this.skills_to_vtt(),
            "name": this.name,
            "mortype": this.mortype(),
            "persona": this.persona?.to_vtt() || {},
            "attackrating": {
                "physical": {
                    "mod": 0
                },
                "astral": {
                    "mod": 0
                },
                "matrix": {
                    "mod": 0
                }
            },

        };
        let items: any[] = [];
        items = items.concat(this.languageskills?.map(x => x.to_vtt()) || []);
        items = items.concat(this.adeptPowers?.map(x => x.to_vtt()) || []);
        items = items.concat(this.items?.map(x => x.to_vtt()) || []);
        items = items.concat(this.weapons?.map(x => x.to_vtt()) || []);
        items = items.concat(this.bodytech?.map(x => x.to_vtt()) || []);
        items = items.concat(this.programs?.map(x => x.to_vtt()) || []);
        return {
            "name": this.name,
            "type": "NPC",
            "items": items,
            "data": data,
        }
    }
}
