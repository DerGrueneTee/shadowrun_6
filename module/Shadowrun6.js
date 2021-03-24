import { SR6 } from "./config.js";
import { Shadowrun6ActorSheet } from "./sheets/PC.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";
import { preloadHandlebarsTemplates } from "./templates.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function() {
  
    console.log(`Initializing Shadowrun 6 System`);

    // Create a namespace within the game global
    game.splimo = {
     config: SR6,
   };

   // Record Configuration Values
   CONFIG.SR6 = SR6;

    // Define custom Entity classes
  CONFIG.Actor.entityClass = Shadowrun6Actor;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheet, { makeDefault: true });
  console.log(Actors.registeredSheets);
//   Items.unregisterSheet("core", ItemSheet);
 // Items.registerSheet("worldbuilding", SimpleItemSheet, { makeDefault: true });
  preloadHandlebarsTemplates();

  Handlebars.registerHelper( 'concat', function(op1,op2) {
	  return op1+op2;
	});
  Handlebars.registerHelper( 'concat3', function(op1,op2,op3) {
	  return op1+op2+op3;
	});
  Handlebars.registerHelper( 'skillAttr', getSkillAttribute);
  Handlebars.registerHelper( 'attrVal', getAttributeValue);
  Handlebars.registerHelper('ifIn', function(elem, list, options) {
	  if(list.indexOf(elem) > -1) {
	    return options.fn(this);
	  }
	  return options.inverse(this);
	});
}); 

function getAttributeValue(attribs, key) {
	return 5;
}

function getSkillAttribute(key) {

	const skillIDs = [
		["astral", "agi"],
		["athletics","agi"],
		["biotech", "log"],
		["close_combat", "agi"],
		["con", "cha"],
		["conjuring", "mag"],
		["cracking", "log"],
		["electronics", "log"],
		["enchanting", "mag"],
		["engineering", "log"],
		["exotic_weapons","agi"],
		["firearms","agi"],
		["influence", "cha"],
		["outdoors", "int"],
		["perception", "int"],
		["piloting", "rea"],
		["sorcery", "mag"],
		["stealth", "agi"],
		["tasking", "res"],
		];

  var myMap = new Map(skillIDs);
  const myElem = myMap.get(key);
	console.log("Map "+key+" to "+myElem);
	return myElem;
};