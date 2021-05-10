import { SR6 } from "./config.js";
import { Shadowrun6ActorSheet } from "./sheets/ActorSheetPC.js";
import { Shadowrun6ActorNPCSheet } from "./sheets/ActorSheetNPC.js";
import { QualityItemSheet } from "./sheets/ItemSheetQuality.js";
import { SR6ItemSheet } from "./sheets/SR6ItemSheet.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import SR6Roll from "./dice/sr6_roll.js";
import { doRoll } from "./dice/ChatDiceRoller.js";
import * as Macros from "./util/macros.js"

const diceIconSelector = '#chat-controls .chat-control-icon .fa-dice-d20';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function () {

  console.log(`Initializing Shadowrun 6 System`);

  // Record Configuration Values
  CONFIG.SR6 = SR6;

  // Define custom Entity classes (changed for Foundry 0.8.x
  CONFIG.Actor.documentClass = Shadowrun6Actor;
  // Define custom Roll class
  CONFIG.Dice.rolls.push(SR6Roll);

  // Create a namespace within the game global
  game.shadowrun6 = {
        itemCheck: Macros.itemCheck
    }
  game.system.data.initiative = "@initiative.physical.pool + (@initiative.physical.dice)d6";

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheet, { types: ["Player"], makeDefault: true });
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorNPCSheet, {
    types: ["NPC"],
    makeDefault: true
  });
  Items.registerSheet("shadowrun6-eden", QualityItemSheet, { types: ["quality"], makeDefault: true });
  Items.registerSheet("shadowrun6-eden", SR6ItemSheet, { types: ["gear"], makeDefault: true });
  preloadHandlebarsTemplates();

  Handlebars.registerHelper('concat', function (op1, op2) {
    return op1 + op2;
  });
  Handlebars.registerHelper('concat3', function (op1, op2, op3) {
    return op1 + op2 + op3;
  });
  Handlebars.registerHelper('skillAttr', getSkillAttribute);
  Handlebars.registerHelper('attrVal', getAttributeValue);
  Handlebars.registerHelper('ifIn', function (elem, list, options) {
    if (list.indexOf(elem) > -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Hooks.on('ready', () => {
    // Render a modal on click.
    $(document).on('click', diceIconSelector, ev => {
      ev.preventDefault();
      console.log("geklickt");
      // Roll and return
      let data = {
        value: 0,
        title: "",
      };
      data.speaker = ChatMessage.getSpeaker({ actor: this });
      return doRoll(data);
    });
  });


	/*
	 * Something has been dropped on the HotBar 
	 */
	Hooks.on("hotbarDrop", async (bar, data, slot) => {
		console.log("DROP to Hotbar");
    let macroData = {
        name: "",
        type: "script",
        img: "icons/svg/dice-target.svg",
        command: ""
    };

	// For items, memorize the skill check	
    if (data.type === "Item") {
		  console.log("Item dropped "+data);
        if (data.id) {
            data.data = game.items.get(data.id).data;
        }
        if (data.data) {
            macroData.name = data.data.name;
            macroData.img = data.data.img;

            let actorId = data.actorId || "";

            if (actorId && game.user.isGM) {
                const actorName = game.actors.get(actorId)?.data.name;
                macroData.name += ` (${actorName})`;
            }

            macroData.command = `game.shadowrun6.itemCheck("${data.data.type}","${data.data.name}","${actorId}","${data.data._id}")`;

        }
    };

    if (macroData.command != "" && macroData.name != "") {
        let macro = await Macro.create(macroData, { displaySheet: false });

        game.user.assignHotbarMacro(macro, slot);
    }
});


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
        boolean = a && b;
        break;
      case '||':
        boolean = a || b;
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
});



function getAttributeValue(attribs, key) {
  return 5;
}

function getSkillAttribute(key) {
  if (CONFIG.SR6.ATTRIB_BY_SKILL.get(key)) {
    const myElem = CONFIG.SR6.ATTRIB_BY_SKILL.get(key).attrib;
    return myElem;
  } else {
    return "??";
  }
};