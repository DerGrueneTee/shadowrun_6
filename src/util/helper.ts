import { Lifeform, Skill } from "../ActorTypes";
import { SkillDefinition } from "../DefinitionTypes";
import { Shadowrun6Actor } from "../Shadowrun6Actor";

function isLifeform(obj: any): obj is Lifeform {
    return obj.attributes != undefined;
}

export function attackRatingToString(val : number[]) : string { 
	return val[0] + "/" +
      ((val[1] != 0) ? val[1] : "-") + "/" +
      ((val[2] != 0) ? val[2] : "-") + "/" +
      ((val[3] != 0) ? val[3] : "-") + "/" +
      ((val[4] != 0) ? val[4] : "-");
}

export const defineHandlebarHelper = async function() {
	
  Handlebars.registerHelper('attackrating', function (val) {
    return val[0] + "/" +
      ((val[1] != 0) ? val[1] : "-") + "/" +
      ((val[2] != 0) ? val[2] : "-") + "/" +
      ((val[3] != 0) ? val[3] : "-") + "/" +
      ((val[4] != 0) ? val[4] : "-");
  });
  Handlebars.registerHelper('spellRangeName', function (val) {
    return (game as Game).i18n.localize(CONFIG.SR6.spell_range[val]);
  });
  Handlebars.registerHelper('spellTypeName', function (val) {
    return (game as Game).i18n.localize(CONFIG.SR6.spell_type[val]+"_short");
  });
  Handlebars.registerHelper('spellDurationName', function (val) {
    return (game as Game).i18n.localize(CONFIG.SR6.spell_duration[val]+"_short");
  });
  Handlebars.registerHelper('concat', function (op1, op2) {
    return op1 + op2;
  });
  Handlebars.registerHelper('concat3', function (op1, op2, op3) {
    return op1 + op2 + op3;
  });

  Handlebars.registerHelper('ifIn', function (elem, list, options) {
    if (list.indexOf(elem) > -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });



  Handlebars.registerHelper('skillAttr', getSkillAttribute);
  Handlebars.registerHelper('skillPool', getSkillPool);
  Handlebars.registerHelper('gearSubtype', getSubtypes);
  Handlebars.registerHelper('ritualFeat', getRitualFeatures);
  Handlebars.registerHelper('spellFeat', getSpellFeatures);
  Handlebars.registerHelper('matrixPool', getMatrixActionPool);

/*
	Handlebars.registerHelper('description', function (itemData, type) {
   	let key = type+"."+itemData.genesisID+".desc";
		let name= game.i18n.localize(key);
		if (name==key) {
			return "";
		}
		return name;
  });
*/

  // Allows {if X = Y} type syntax in html using handlebars
  Handlebars.registerHelper("iff", function (a, operator, b, opts) {
    var bool = false;
    switch (operator) {
      case "==":
        bool = a == b;
        break;
      case ">":
        bool = a > b;
        break;
      case "<":
        bool = a < b;
        break;
      case "!=":
        bool = a != b;
        break;
      case '&&':
        bool = a && b;
        break;
      case '||':
        bool = a || b;
        break;
      case "contains":
        if (a && b) {
          bool = a.includes(b);
        } else {
          bool = false;
        }
        break;
      default:
        throw "Unknown operator " + operator;
    }

    if (bool) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

};


function getSkillAttribute(key) {
	let skillDef : SkillDefinition|undefined = CONFIG.SR6.ATTRIB_BY_SKILL.get(key);
  if (skillDef) {
    const myElem = skillDef.attrib;
    return myElem;
  } else {
    return "??";
  }
};

function getSkillPool(skillId:string, skillSpec:string, actor:Shadowrun6Actor) : number{
	return actor._getSkillPool(skillId, skillSpec);
};

function getSubtypes(key) {
  if (CONFIG.SR6.GEAR_SUBTYPES.get(key)) {
    const myElem = CONFIG.SR6.GEAR_SUBTYPES.get(key);
    return myElem;
  } else {
    return [];
  }
};

function getRitualFeatures(ritual) {
  let ret:string[] = [];
	let i18n = (game as Game).i18n;
  if (ritual.features.material_link) ret.push( i18n.localize("shadowrun6.ritualfeatures.material_link"));
  if (ritual.features.anchored) ret.push(i18n.localize("shadowrun6.ritualfeatures.anchored"));
  if (ritual.features.minion) ret.push(i18n.localize("shadowrun6.ritualfeatures.minion"));
  if (ritual.features.spell) ret.push(i18n.localize("shadowrun6.ritualfeatures.spell"));
  if (ritual.features.spotter) ret.push(i18n.localize("shadowrun6.ritualfeatures.spotter"));
  return ret.join(", ");
};
function getSpellFeatures(spell) {
  let ret:string[] = [];
	let i18n = (game as Game).i18n;
  if (spell.features) {
    if (spell.features.area) ret.push(i18n.localize("shadowrun6.spellfeatures.area"));
    if (spell.features.direct) ret.push(i18n.localize("shadowrun6.spellfeatures.direct"));
    if (spell.features.indirect) ret.push(i18n.localize("shadowrun6.spellfeatures.indirect"));
    if (spell.features.sense_single) ret.push(i18n.localize("shadowrun6.spellfeatures.sense_single"));
    if (spell.features.sense_multi) ret.push(i18n.localize("shadowrun6.spellfeatures.sense_multi"));
  }
  return ret.join(", ");
};

function getMatrixActionPool(key, actor) {
	const action = CONFIG.SR6.MATRIX_ACTIONS[key];
	const skill  = actor.data.data.skills[action.skill];
	let pool = 0;
	if (skill) {
		pool = skill.points + skill.modifier;	
		if (skill.expertise==action.specialization) {
			pool+=3;
		} else if (skill.specialization==action.specialization) {
			pool+=2;
		}
	}
	if (action.attrib) {
		const attrib = actor.data.data.attributes[action.attrib];
		pool += attrib.pool;
	}
	return pool;
};