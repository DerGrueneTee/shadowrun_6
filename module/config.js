// Namespace Configuration Values
export const SR6 = {};

SR6.PRIMARY_ATTRIBUTES = ["bod", "agi", "rea", "str", "wil", "log", "int", "cha"];
SR6.SECONDARY_ATTRIBUTES = ["mag", "res", "edg", "ess", "ini", "inim", "inia", "dr"];
SR6.ATTRIBUTES = ["bod", "agi", "rea", "str", "wil", "log", "int", "cha", "mag", "res"];
SR6.NPC_ATTRIBUTES = ["bod", "agi", "rea", "str", "wil", "log", "int", "cha", "mag", "res", "ess"];
SR6.QUALITY_CATEGORIES = ["ADVANTAGE", "DISADVANTAGE"];
SR6.GEAR_TYPES = ["ACCESSORY", "ARMOR", "ARMOR_ADDITION", "BIOWARE", "CYBERWARE", "TOOLS",
	"ELECTRONICS", "NANOWARE", "GENETICS", "WEAPON_CLOSE_COMBAT", "WEAPON_RANGED", "WEAPON_FIREARMS", "WEAPON_SPECIAL",
	"AMMUNITION", "CHEMICALS", "SURVIVAL", "BIOLOGY", "VEHICLES", "DRONES", "MAGICAL"];
SR6.SKILLS_WEAPON = ["firearms", "close_combat", "exotic_weapons", "athletics"];

class SkillDefinition {
	constructor(attribute, useUntrained) {
		this.attrib = attribute;
		this.useUntrained = useUntrained;
	}
}

SR6.ATTRIB_BY_SKILL = new Map([
	["astral", new SkillDefinition("int", false)],
	["athletics", new SkillDefinition("agi", true)],
	["biotech", new SkillDefinition("log", false)],
	["close_combat", new SkillDefinition("agi", true)],
	["con", new SkillDefinition("cha", true)],
	["conjuring", new SkillDefinition("mag", false)],
	["cracking", new SkillDefinition("log", false)],
	["electronics", new SkillDefinition("log", true)],
	["enchanting", new SkillDefinition("mag", false)],
	["engineering", new SkillDefinition("log", true)],
	["exotic_weapons", new SkillDefinition("agi", false)],
	["firearms", new SkillDefinition("agi", true)],
	["influence", new SkillDefinition("cha", true)],
	["outdoors", new SkillDefinition("int", true)],
	["perception", new SkillDefinition("int", true)],
	["piloting", new SkillDefinition("rea", true)],
	["sorcery", new SkillDefinition("mag", false)],
	["stealth", new SkillDefinition("agi", true)],
	["tasking", new SkillDefinition("res", false)],
]);

SR6.icons = {
	adeptpower: {
		default: "systems/shadowrun6-eden/icons/van-damme-split.svg"
	},
	gear: {
		default: "systems/shadowrun6-eden/icons/pistol-gun.svg"
	},
	martialartstyle: {
		default: "systems/shadowrun6-eden/icons/kimono.svg"
	},
	martialarttech: {
		default: "systems/shadowrun6-eden/icons/nunchaku.svg"
	},
	quality: {
		default: "systems/shadowrun6-eden/icons/skills.svg"
	},
	spell: {
		default: "systems/shadowrun6-eden/icons/bolt-spell-cast.svg"
	}
};

SR6.spell_range = {
	"LINE_OF_SIGHT": "shadowrun6.spell.range_line_of_sight",
	"LINE_OF_SIGHT_AREA": "shadowrun6.spell.range_line_of_sight_area",
	"TOUCH": "shadowrun6.spell.range_touch",
	"SELF": "shadowrun6.spell.range_self",
	"SELF_AREA": "shadowrun6.spell.range_self_area"
};
SR6.spell_category = {
	"COMBAT": "shadowrun6.spell.category_combat",
	"DETECTION": "shadowrun6.spell.category_detection",
	"HEALTH": "shadowrun6.spell.category_health",
	"ILLUSION": "shadowrun6.spell.category_illusion",
	"MANIPULATION": "shadowrun6.spell.category_manipulation"

};
SR6.spell_type = {
	"PHYSICAL" : "shadowrun6.spell.type_physical",
	"MANA": "shadowrun6.spell.type_mana"
};
SR6.spell_duration = {
	"INSTANTANEOUS" : "shadowrun6.spell.duration_instantaneous",
	"SUSTAINED" : "shadowrun6.spell.duration_sustained",
	"PERMANENT" : "shadowrun6.spell.duration_permanent",
	"LIMITED": "shadowrun6.spell.duration_limited",
	"SPECIAL" :  "shadowrun6.spell.duration_special"
};

