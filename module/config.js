// Namespace Configuration Values
export const SR6 = {};

SR6.PRIMARY_ATTRIBUTES   = ["bod","agi","rea","str","wil","log","int","cha"];
SR6.SECONDARY_ATTRIBUTES = ["mag","res","edg","ess","ini","inim","inia","dr"];
SR6.ATTRIBUTES = ["bod","agi","rea","str","wil","log","int","cha","mag","res","edg"];

class SkillDefinition {
	constructor(attribute, useUntrained) {
		this.attrib = attribute;
		this.useUntrained = useUntrained;
	}
}

SR6.ATTRIB_BY_SKILL = new Map([
	["astral"     , new SkillDefinition("int",false)],
	["athletics"  , new SkillDefinition("agi",true)],
	["biotech"    , new SkillDefinition("log",false)],
	["close_combat", new SkillDefinition("agi",true)],
	["con"        , new SkillDefinition("cha",true)],
	["conjuring"  , new SkillDefinition("mag",false)],
	["cracking"   , new SkillDefinition("log",false)],
	["electronics", new SkillDefinition("log",true)],
	["enchanting" , new SkillDefinition("mag",false)],
	["engineering", new SkillDefinition("log",true)],
	["exotic_weapons",new SkillDefinition("agi",false)],
	["firearms"   , new SkillDefinition("agi",true)],
	["influence"  , new SkillDefinition("cha",true)],
	["outdoors"   , new SkillDefinition("int",true)],
	["perception" , new SkillDefinition("int",true)],
	["piloting"   , new SkillDefinition("rea",true)],
	["sorcery"    , new SkillDefinition("mag",false)],
	["stealth"    , new SkillDefinition("agi",true)],
	["tasking"    , new SkillDefinition("res",false)],
	]);
