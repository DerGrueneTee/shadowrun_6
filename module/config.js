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
SR6.GEAR_SUBTYPES = new Map([
	["ACCESSORY", []],
	["ARMOR",  ["ARMOR_BODY","ARMOR_HELMET","ARMOR_SHIELD"]],
	["ARMOR_ADDITION",  []],
	["BIOWARE",  ["BIOWARE_STANDARD","BIOWARE_CULTURED","BIOWARE_IMPLANT_WEAPON"]],
	["CYBERWARE",  ["CYBER_HEADWARE","CYBERJACK","CYBER_EYEWARE","CYBER_BODYWARE","CYBER_EARWARE","CYBER_IMPLANT_WEAPON","CYBER_LIMBS","COMMLINK","CYBERDECK"]],
	["TOOLS", ["TOOLS"]],
	["ELECTRONICS",  ["COMMLINK","CYBERDECK","ELECTRONIC_ACCESSORIES","RIGGER_CONSOLE","RFID","COMMUNICATION","ID_CREDIT","IMAGING","OPTICAL","AUDIO","SENSOR_HOUSING","SECURITY","BREAKING","TAC_NET"]],
	["NANOWARE",  []],
	["GENETICS",  []],
	["WEAPON_CLOSE_COMBAT", ["BLADES","CLUBS","WHIPS","UNARMED","OTHER_CLOSE"]], 
	["WEAPON_RANGED",  ["BOWS","CROSSBOWS","THROWING"]],
	["WEAPON_FIREARMS",  ["TASERS","HOLDOUTS","PISTOLS_LIGHT","MACHINE_PISTOLS","PISTOLS_HEAVY","SUBMACHINE_GUNS","SHOTGUNS","RIFLE_ASSAULT","RIFLE_HUNTING","RIFLE_SNIPER","LMG","MMG","HMG","ASSAULT_CANNON"]],
	["WEAPON_SPECIAL", ["LAUNCHERS","THROWERS","OTHER_SPECIAL"]],
	["AMMUNITION",  ["AMMUNITION","ROCKETS","MISSILES","EXPLOSIVES","GRENADES"]],
	["CHEMICALS",  ["INDUSTRIAL_CHEMICALS","TOXINS","DRUGS","BTL"]],
	["SURVIVAL",  ["SURVIVAL_GEAR","GRAPPLE_GUN"]],
	["BIOLOGY",  ["BIOTECH","SLAP_PATCHES"]],
	["VEHICLES",  ["BIKES","CARS","TRUCKS","BOATS","SUBMARINES","FIXED_WING","ROTORCRAFT","VTOL","WALKER"]],
	["DRONES",  ["MICRODRONES","MINIDRONES","SMALL_DRONES","MEDIUM_DRONES","LARGE_DRONES"]],
	["MAGICAL", ["MAGIC_SUPPLIES"]]
	]);

   SR6.GEAR_SUBTYPES2 = {
      "ELECTRONICS": ["COMMLINK","CYBERDECK","ELECTRONIC_ACCESSORIES","RIGGER_CONSOLE","RFID","COMMUNICATION","ID_CREDIT","IMAGING","OPTICAL","AUDIO","SENSOR_HOUSING","SECURITY","BREAKING","TAC_NET"],
   };

SR6.SKILLS_WEAPON = ["firearms", "close_combat", "exotic_weapons", "athletics"];

class MagicOrResonanceDefinition {
	constructor(magic=false, resonance=false, useSpells=false,usePowers=false) {
		this.magic = magic;
		this.resonance = resonance;
		this.useSpells = useSpells;
		this.usePowers = usePowers;
	}
}
SR6.MOR_TYPES = ["mundane","magician","mysticadept","technomancer","adept","aspectedmagician"];
SR6.MOR_DEFINITIONS = {
	"mundane"     : new MagicOrResonanceDefinition(),
	"magician"    : new MagicOrResonanceDefinition(true,false,true,false),
	"mysticadept" : new MagicOrResonanceDefinition(true,false,true,true),
	"technomancer": new MagicOrResonanceDefinition(false,true,false,false),
	"adept"       : new MagicOrResonanceDefinition(true,false,false,true),
	"aspectedmagician": new MagicOrResonanceDefinition(true,false,true,false)
};

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

class EdgeBoost {
	constructor(cost, id, when) {
		this.cost = cost;
		this.id = id;
		this.when = when;
	}
}
SR6.EDGE_BOOSTS = [
	new EdgeBoost(1, "reroll_one", "POST"),
	new EdgeBoost(1, "plus_3_ini", "ANYTIME"),
	new EdgeBoost(2, "plus_1_roll", "POST"),
	new EdgeBoost(2, "give_ally_1_edge", "ANYTIME"),
	new EdgeBoost(2, "negate_1_edge", "PRE"),
	new EdgeBoost(3, "buy_auto_hit", "ANYTIME"),
	new EdgeBoost(3, "heal_1_stun", "ANYTIME"),
	new EdgeBoost(4, "add_edge_pool", "PRE"),
	new EdgeBoost(4, "heal_1_physic", "ANYTIME"),
	new EdgeBoost(4, "reroll_failed", "POST"),
	new EdgeBoost(5, "count_2_glitch", "PRE"),
	new EdgeBoost(5, "create_special", "ANYTIME"),
];
class EdgeAction {
	constructor(cost, id, cat, skill) {
		this.cost = cost;
		this.id = id;
		this.cat = cat;
		this.skill = skill;
	}
}
SR6.EDGE_ACTIONS = [
	new EdgeAction(4, "anticipation", "COMBAT"),
	new EdgeAction(4, "big_speech", "SOCIAL", "influence"),
	new EdgeAction(2, "bring_the_drama", "SOCIAL", "con"),
	new EdgeAction(5, "called_shot_disarm", "COMBAT"),
	new EdgeAction(5, "called_shot_vitals", "COMBAT"),
	new EdgeAction(2, "fire_from_cover", "COMBAT"),
	new EdgeAction(2, "knockout_blow", "COMBAT"),
	new EdgeAction(1, "shank", "COMBAT"),
];

SR6.FIRING_OPTIONS = new Map([
	["SS", ["single_shot"]],
	["SA", ["single_shot","double_shot"]],
	["BF", ["narrow_burst","wide_burst"]],
	["FA", ["multi_shot"]],
]);

SR6.icons = {
	adeptpower: {
		default: "systems/shadowrun6-eden/icons/van-damme-split.svg"
	},
	critterpower: {
		default: "systems/shadowrun6-eden/icons/wolf-howl.svg"
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
	"line_of_sight": "shadowrun6.spell.range_line_of_sight",
	"line_of_sight_area": "shadowrun6.spell.range_line_of_sight_area",
	"touch": "shadowrun6.spell.range_touch",
	"self": "shadowrun6.spell.range_self",
	"self_area": "shadowrun6.spell.range_self_area"
};
SR6.spell_category = {
	"combat": "shadowrun6.spell.category_combat",
	"detection": "shadowrun6.spell.category_detection",
	"health": "shadowrun6.spell.category_health",
	"illusion": "shadowrun6.spell.category_illusion",
	"manipulation": "shadowrun6.spell.category_manipulation"

};
SR6.spell_type = {
	"physical" : "shadowrun6.spell.type_physical",
	"mana": "shadowrun6.spell.type_mana"
};
SR6.spell_duration = {
	"instantaneous" : "shadowrun6.spell.duration_instantaneous",
	"sustained" : "shadowrun6.spell.duration_sustained",
	"permanent" : "shadowrun6.spell.duration_permanent",
	"limited": "shadowrun6.spell.duration_limited",
	"special" :  "shadowrun6.spell.duration_special"
};
SR6.spell_damage = {
	"physical" : "shadowrun6.spell.damage_physical",
	"stun"     : "shadowrun6.spell.damage_stun",
	"physical_special" : "shadowrun6.spell.damage_physical_special",
	"stun_special"     : "shadowrun6.spell.damage_stun_special",
};
SR6.tradition_attributes = {
	"log" : "attrib.log",
	"cha" : "attrib.cha",
	"int" : "attrib.int",
};

SR6.adeptpower_activation = {
	"passive" : "shadowrun6.adeptpower.activation_passive",
	"minor_action" : "shadowrun6.adeptpower.activation_minor",
	"major_action" : "shadowrun6.adeptpower.activation_major",
};
SR6.skill_special = {
   "astral": {
      "astral_combat": "shadowrun6.special.astral.astral_combat",
      "astral_signatures": "shadowrun6.special.astral.astral_signatures",
      "emotional_stress": "shadowrun6.special.astral.emotional_stress",
      "spirit_types": "shadowrun6.special.astral.spirit_types",
   },
   "athletics": {
      "climbing": "shadowrun6.special.athletics.climbing",
      "flying": "shadowrun6.special.athletics.flying",
      "gymnastics": "shadowrun6.special.athletics.gymnastics",
      "sprinting": "shadowrun6.special.athletics.sprinting",
      "swimming": "shadowrun6.special.athletics.swimming",
      "throwing": "shadowrun6.special.athletics.throwing",
      "archery": "shadowrun6.special.athletics.archery",
   },
   "biotech": {
      "biotechnology": "shadowrun6.special.biotech.biotechnology",
      "cybertechnology": "shadowrun6.special.biotech.cybertechnology",
      "first_aid": "shadowrun6.special.biotech.first_aid",
      "medicine": "shadowrun6.special.biotech.medicine",
   },
   "close_combat": {
      "blades": "shadowrun6.special.close_combat.blades",
      "clubs": "shadowrun6.special.close_combat.clubs",
      "unarmed": "shadowrun6.special.close_combat.unarmed",
   },
   "con": {
      "acting": "shadowrun6.special.con.acting",
      "disguise": "shadowrun6.special.con.disguise",
      "impersonation": "shadowrun6.special.con.impersonation",
      "performance": "shadowrun6.special.con.performance",
   },
   "conjuring": {
      "banishing": "shadowrun6.special.conjuring.banishing",
      "summoning": "shadowrun6.special.conjuring.summoning",
   },
   "cracking": {
      "cybercombat": "shadowrun6.special.cracking.cybercombat",
      "electronic_warfare": "shadowrun6.special.cracking.electronic_warfare",
      "hacking": "shadowrun6.special.cracking.hacking",
   },
   "electronics": {
      "computer": "shadowrun6.special.electronics.computer",
      "hardware": "shadowrun6.special.electronics.hardware",
      "software": "shadowrun6.special.electronics.software",
   },
   "enchanting": {
      "alchemy": "shadowrun6.special.enchanting.alchemy",
      "artificing": "shadowrun6.special.enchanting.artificing",
      "disenchanting": "shadowrun6.special.enchanting.disenchanting",
   },
   "engineering": {
      "aeronautics_mechanic": "shadowrun6.special.engineering.aeronautics_mechanic",
      "armorer": "shadowrun6.special.engineering.armorer",
      "automotive_mechanic": "shadowrun6.special.engineering.automotive_mechanic",
      "demolitions": "shadowrun6.special.engineering.demolitions",
      "gunnery": "shadowrun6.special.engineering.gunnery",
      "industrial_mechanic": "shadowrun6.special.engineering.industrial_mechanic",
      "lockpicking": "shadowrun6.special.engineering.lockpicking",
      "nautical_mechanic": "shadowrun6.special.engineering.nautical_mechanic",
   },
   "exotic_weapons": {
   },
   "firearms": {
      "tasers": "shadowrun6.special.firearms.tasers",
      "holdouts": "shadowrun6.special.firearms.holdouts",
      "pistols_light": "shadowrun6.special.firearms.pistols_light",
      "pistols_heavy": "shadowrun6.special.firearms.pistols_heavy",
      "machine_pistols": "shadowrun6.special.firearms.machine_pistols",
      "submachine_guns": "shadowrun6.special.firearms.submachine_guns",
      "rifles": "shadowrun6.special.firearms.rifles",
      "shotguns": "shadowrun6.special.firearms.shotguns",
      "assault_cannons": "shadowrun6.special.firearms.assault_cannons",
   },
   "influence": {
      "etiquette": "shadowrun6.special.influence.etiquette",
      "instruction": "shadowrun6.special.influence.instruction",
      "intimidation": "shadowrun6.special.influence.intimidation",
      "leadership": "shadowrun6.special.influence.leadership",
      "negotiation": "shadowrun6.special.influence.negotiation",
   },
   "outdoors": {
      "navigation": "shadowrun6.special.outdoors.navigation",
      "survival": "shadowrun6.special.outdoors.survival",
      "tracking_woods": "shadowrun6.special.outdoors.tracking_woods",
      "tracking_desert": "shadowrun6.special.outdoors.tracking_desert",
      "tracking_urban": "shadowrun6.special.outdoors.tracking_urban",
      "tracking_other": "shadowrun6.special.outdoors.tracking_other",
   },
   "perception": {
      "visual": "shadowrun6.special.perception.visual",
      "aural": "shadowrun6.special.perception.aural",
      "tactile": "shadowrun6.special.perception.tactile",
      "scent": "shadowrun6.special.perception.scent",
      "taste": "shadowrun6.special.perception.taste",
      "perception_woods": "shadowrun6.special.perception.perception_woods",
      "perception_desert": "shadowrun6.special.perception.perception_desert",
      "perception_urban": "shadowrun6.special.perception.perception_urban",
      "perception_other": "shadowrun6.special.perception.perception_other",
   },
   "piloting": {
      "ground_craft": "shadowrun6.special.piloting.ground_craft",
      "aircraft": "shadowrun6.special.piloting.aircraft",
      "watercraft": "shadowrun6.special.piloting.watercraft",
   },
   "sorcery": {
      "counterspelling": "shadowrun6.special.sorcery.counterspelling",
      "ritual_spellcasting": "shadowrun6.special.sorcery.ritual_spellcasting",
      "spellcasting": "shadowrun6.special.sorcery.spellcasting",
   },
   "stealth": {
      "disguise": "shadowrun6.special.stealth.disguise",
      "palming": "shadowrun6.special.stealth.palming",
      "sneaking": "shadowrun6.special.stealth.sneaking",
      "camouflage": "shadowrun6.special.stealth.camouflage",
   },
   "tasking": {
      "compiling": "shadowrun6.special.tasking.compiling",
      "decompiling": "shadowrun6.special.tasking.decompiling",
      "registering": "shadowrun6.special.tasking.registering",
   },
};

SR6.VEHICLE_TYPE = {
	"GROUND": "shadowrun6.vehicle.type.groundcraft",
	"WATER": "shadowrun6.vehicle.type.watercraft",
	"AIR": "shadowrun6.vehicle.type.aircraft",
};
SR6.VEHICLE_MODE = {
	"manual"  : "shadowrun6.vehicle.mode.manual",
	"riggedAR": "shadowrun6.vehicle.mode.riggedAR",
	"riggedVR": "shadowrun6.vehicle.mode.riggedVR",
	"rcc"     : "shadowrun6.vehicle.mode.rcc",
	"autonomous": "shadowrun6.vehicle.mode.autonomous",
};
SR6.CONTROL_RIG_RATING = {
	"0": "shadowrun6.label.not_present",
	"1": "shadowrun6.label.rating1",
	"2": "shadowrun6.label.rating2",
	"3": "shadowrun6.label.rating3",
};

class MatrixAction {
	constructor(id, skill,spec,attrib, illegal,major, outsider,user,admin, attr1, attr2, threshold=0) {
		this.id = id;
		this.skill   = skill;
		this.spec    = spec;
		this.attrib  = attrib;
		this.illegal = illegal;
		this.major   = major;
		this.outsider= outsider;
		this.user    = user;
		this.admin   = admin;
		this.opposedAttr1 = attr1;
		this.opposedAttr2 = attr2;
		this.threshold = threshold;
	}
}
SR6.MATRIX_ACTIONS = {
	"backdoor_entry": new MatrixAction("backdoor_entry"  , "cracking"   ,"hacking"    , "log", true, true,   true, false, false, "wil", "f"),
	"brute_force"   : new MatrixAction("brute_force"     , "cracking"   ,"cybercombat", "log", true, true,   true, true , true , "wil", "f"),
	"change_icon"   : new MatrixAction("change_icon"     , null         , null        , null, false,false,  false, true, true , undefined,null, -1),
	"check_os"      : new MatrixAction("check_os"        , "cracking"   , "electronic_warfare", "log", true , true,  false, false, true, null,null,4),
	"control_device": new MatrixAction("control_device"  , "electronics", "software"  , "log", false, true,  false, true, true , "wil", "f"),
	"crack_file"    : new MatrixAction("crack_file"      , "cracking"   ,"hacking"    , "log", true , true,  false, true, true , undefined,null,99),
	"crash_program" : new MatrixAction("crash_program"   , "cracking"   ,"cybercombat", "log", true , true,  false, false, true, "d", "dr"),
	"data_spike"    : new MatrixAction("data_spike"      , "cracking"   ,"cybercombat", "log", true , true,  false, true, true , "d", "f"),
 "disarm_data_bomb": new MatrixAction("disarm_data_bomb", "electronics","software"   , "log", false, true,  false, true, true , "dr", "dr"),
	"edit_file"     : new MatrixAction("edit_file"       , "electronics","computer"   , "log", false, true,  false, true, true , "int", "f"),
	"encrypt_file"  : new MatrixAction("encrypt_file"    , "electronics","computer"   , "log", false, true,  false, true, true , null, null),
	"enter_host"    : new MatrixAction("enter_host"      , null         ,null         , "log", false, true,  true , true, true , null, null),
 "erase_matrix_signature": new MatrixAction("erase_matrix_signature", "electronics","computer", "log", true, true,  false, true, true , "wil", "f"),
	"format_device" : new MatrixAction("format_device"   , "electronics","computer"   , "log", true , true,  false, false, true , "wil", "f"),
	"full_matrix_defense": new MatrixAction("full_matrix_defense", null ,null         , "log", false, true,  true , true, true , null, null),
	"hash_check"    : new MatrixAction("hash_check"      , "cracking"   ,"hacking"    , "log", true , true,  false, true, false ,null, null),
	"hide"          : new MatrixAction("hide"            , "cracking","electronic_warfare","int", true , true,  true, true, false ,"int", "d"),
	"jack_out"      : new MatrixAction("jack_out"        , "electronics","software"   , "wil", false, true,  true , true, true , "cha", "d"),
	"jam_signals"   : new MatrixAction("jam_signals"     , "cracking"   ,"electronic_warfare"  , "log", true , true,  false, false, true , null,null),
	"jump_rigged"   : new MatrixAction("jump_rigged"     , "electronics","software"   , "log", false , true,  false, true , true , "wil","f"),
"matrix_perception": new MatrixAction("matrix_perception","electronics","computer"   , "int", false , true,  false, true , true , "wil","s"),
	"matrix_search" : new MatrixAction("matrix_search"   , "electronics","computer"   , "int", false , true,  true , true , true , null,null),
	"probe"         : new MatrixAction("probe"           , "cracking"   ,"hacking"    , "log", true  , true,  true , true, false ,"wil", "f"),
	"reboot_device" : new MatrixAction("reboot_device"   , "electronics","software"   , "log", false , true,  false, false, true , "log","wil"),
	"reconfigure"   : new MatrixAction("reconfigure"     , null         ,null         , null , false , false, false, false, true , null,null),
	"send_message"  : new MatrixAction("send_message"    , null         ,null         , null , false , false, false, false, true , null,null),
	"set_data_bomb" : new MatrixAction("set_data_bomb"   , "electronics","software"   , "log", true  , true,  false, false, true ,"dr", "dr"),
	"snoop"         : new MatrixAction("snoop"           , "cracking"   ,"electronic_warfare", "log", true, true,  true , true, true ,"d", "f"),
	"spoof_command" : new MatrixAction("spoof_command"   , "cracking"   ,"hacking"    , "log", true, true,  true , true, true ,"d", "f"),
	"switch_ifmode" : new MatrixAction("switch_ifmode"   , null         ,null         , null , false , false, false, false, true , null,null),
	"tarpit"        : new MatrixAction("tarpit"          , "cracking"   ,"cybercombat", "log", true , true,  false, true, true , "d", "f"),
	"trace_icon"    : new MatrixAction("trace_icon"      , "electronics","software"   , "int", true , true,  false , false , true , "wil","s"),
};

class ComplexForm {
	constructor(skill,attr1, attr2, threshold=0) {
		this.skill   = skill;
		this.opposedAttr1 = attr1;
		this.opposedAttr2 = attr2;
		this.threshold = threshold;
	}
}
SR6.COMPLEX_FORMS = {
	"cleaner"  : new ComplexForm("electronics", null,null),
	"diffusion": new ComplexForm("electronics", "wil","f"),
	"editor"   : new ComplexForm(null, null,null),
	"emulate"  : new ComplexForm(null, null,null),
	"infusion" : new ComplexForm("electronics", null,null, 4),
	"mirrored_persona" : new ComplexForm("electronics", null,null),
	"pulse_storm"      : new ComplexForm("electronics", "log","d"),
	"puppeteer"        : new ComplexForm(null, null,null),
	"resonance_channel": new ComplexForm("electronics", null,null),
	"resonance_spike"  : new ComplexForm("cracking", "wil","f"),
	"resonance_veil"   : new ComplexForm("electronics", "int","d"),
	"static_bomb"      : new ComplexForm("electronics", "int","d"),
	"static_veil"      : new ComplexForm("electronics", "f","f"),
	"stitches"         : new ComplexForm("electronics", null,null),
	"tattletale"       : new ComplexForm("electronics", null,null),
};

class Program {
	constructor(id, type) {
		this.id = id;
		this.type = type;
	}
}

SR6.PROGRAMS = [
	// Legal
 	new Program("browse", 0),
 	new Program("baby_monitor", 0),
 	new Program("configurator", 0),
 	new Program("edit", 0),
 	new Program("encryption", 0),
 	new Program("signal_scrubber", 0),
 	new Program("toolbox", 0),
 	new Program("virtual_machine", 0),
	// Hacking
 	new Program("armor", 1),
 	new Program("biofeedback", 1),
 	new Program("biofeedback_filter", 1),
 	new Program("blackout", 1),
 	new Program("decryption", 1),
 	new Program("defuse", 1),
 	new Program("exploit", 1),
 	new Program("fork", 1),
 	new Program("lockdown", 1),
 	new Program("overclock", 1),
 	new Program("stealth", 1),
 	new Program("trace", 1),
	
];




SR6.LIFESTYLE_TYPE = {
    "street"  : "shadowrun6.lifestyle.street",
    "squatter": "shadowrun6.lifestyle.squatter",
    "low"     : "shadowrun6.lifestyle.low",
    "middle"  : "shadowrun6.lifestyle.middle",
    "high"    : "shadowrun6.lifestyle.high",
    "luxury"  : "shadowrun6.lifestyle.luxury"
};
	SR6.SIN_QUALITY = {
	"REAL_SIN"        : "shadowrun6.sin.real_sin",
	"ANYONE"          : "shadowrun6.sin.anyone",
	"ROUGH_MATCH"     : "shadowrun6.sin.rough_match",
	"GOOD_MATCH"      : "shadowrun6.sin.good_match",
	"SUPERFICIALLY_PLAUSIBLE": "shadowrun6.sin.superficially_plausible",
	"HIGHLY_PLAUSIBLE": "shadowrun6.sin.highly_plausible",
	"SECOND_LIFE"     : "shadowrun6.sin.second_life"
};
