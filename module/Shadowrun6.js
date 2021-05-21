import { SR6 } from "./config.js";
import { Shadowrun6ActorSheet } from "./sheets/SR6ActorSheet.js";
import { Shadowrun6ActorSheetPC } from "./sheets/ActorSheetPC.js";
import { Shadowrun6ActorSheetNPC } from "./sheets/ActorSheetNPC.js";
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
  game.system.data.initiative = "@initiative.physical.pool + (@initiative.physical.dicePool)d6";

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetPC, { types: ["Player"], makeDefault: true });
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetNPC, { types: ["NPC"], makeDefault: true });

  Items.registerSheet("shadowrun6-eden", QualityItemSheet, { types: ["quality"], makeDefault: true });
  Items.registerSheet("shadowrun6-eden", SR6ItemSheet, { types: ["gear"], makeDefault: true });

  preloadHandlebarsTemplates();

  Handlebars.registerHelper('attackrating', function (val) {
    return val[0] + "/" +
      ((val[1] != 0) ? val[1] : "-") + "/" +
      ((val[2] != 0) ? val[2] : "-") + "/" +
      ((val[3] != 0) ? val[3] : "-") + "/" +
      ((val[4] != 0) ? val[4] : "-");
  });
  Handlebars.registerHelper('concat', function (op1, op2) {
    return op1 + op2;
  });
  Handlebars.registerHelper('concat3', function (op1, op2, op3) {
    return op1 + op2 + op3;
  });
  Handlebars.registerHelper('skillAttr', getSkillAttribute);
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
      console.log("Item dropped " + data);
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

        macroData.command = `game.shadowrun6.itemCheck("${data.data.type}","${data.data.name}","${actorId}","${data.data.id}")`;

      }
    };

    if (macroData.command != "" && macroData.name != "") {
      let macro = await Macro.create(macroData, { displaySheet: false });

      game.user.assignHotbarMacro(macro, slot);
    }
  });

  Hooks.once('diceSoNiceReady', (dice3d) => {
    dice3d.addSystem({ id: "SR6", name: "Shadowrun 6 - Eden" }, "force");
    dice3d.addDicePreset({
      type: "d6",
      labels: [
        "", "2", "3", "4", "5", "6"
//        "systems/shadowrun6-eden/icons/SR6_D6_5_o.png",
//        "systems/shadowrun6-eden/icons/SR6_D6_6_o.png"
      ],
      bumpMaps: [, , , , ,
//        "systems/shadowrun6-eden/icons/SR6_D6_5_o.png",
//        "systems/shadowrun6-eden/icons/SR6_D6_6_o.png"
      ],
      colorset: "SR6_dark",
      system: "SR6"
    });
    dice3d.addColorset({
      name: 'SR6_light',
      description: "SR 6 Pink",
      category: "SR6",
      foreground: '#470146',
      background: "#f7c8f6",
      outline: '#2e2b2e',
      texture: 'none',
      edge: '#9F8003',
      material: 'glass',
      font: 'Arial Black',
      fontScale: {
        "d6": 1.1,
        "df": 2.5
      },
      visibility: 'visible'
    }, "no");

    dice3d.addColorset({
      name: 'SR6_dark',
      description: "SR 6 Pink Dark",
      category: "SR6",
      foreground: '#470146',
      background: "#000000",
      outline: '#2e2b2e',
      texture: 'none',
      edge: '#470146',
      material: 'metal',
      font: 'Arial Black',
      fontScale: {
        "d6": 1.1,
        "df": 2.5
      },
      visibility: 'visible'
    }, "default");




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
});

function getSkillAttribute(key) {
  if (CONFIG.SR6.ATTRIB_BY_SKILL.get(key)) {
    const myElem = CONFIG.SR6.ATTRIB_BY_SKILL.get(key).attrib;
    return myElem;
  } else {
    return "??";
  }
};

$.fn.closestData = function (dataName, defaultValue = "") {
  let value = this.closest(`[data-${dataName}]`)?.data(dataName);
  return (value) ? value : defaultValue;
}