import { SR6 } from "./config.js";
import { Shadowrun6ActorSheet } from "./sheets/SR6ActorSheet.js";
import { Shadowrun6ActorSheetPC } from "./sheets/ActorSheetPC.js";
import { Shadowrun6ActorSheetNPC } from "./sheets/ActorSheetNPC.js";
import { SR6ItemSheet } from "./sheets/SR6ItemSheet.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import SR6Roll from "./dice/sr6_roll.js";
import EdgeUtil from "./util/EdgeUtil.js";
import { doRoll } from "./dice/CommonRoll.js";
import { rollDefense } from "./dice/CommonRoll.js";
import * as Macros from "./util/macros.js"
import { registerSystemSettings } from "./settings.js";
import Shadowrun6Combat from "./combat.js";

const diceIconSelector = '#chat-controls .chat-control-icon .fa-dice-d20';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function () {

  console.log(`Initializing Shadowrun 6 System`);
  CONFIG.debug.hooks = false;
  // Record Configuration Values
  CONFIG.SR6 = SR6;

  // Define custom Entity classes (changed for Foundry 0.8.x
  CONFIG.Actor.documentClass = Shadowrun6Actor;
  CONFIG.Combat.documentClass = Shadowrun6Combat;
  // Define custom Roll class
  CONFIG.Dice.rolls.push(SR6Roll);

  // Create a namespace within the game global
  game.shadowrun6 = {
    itemCheck: Macros.itemCheck,
	 maxEdgePerRound: 2
  }
  game.system.data.initiative = "@initiative.physical.pool + (@initiative.physical.dicePool)d6";
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetPC, { types: ["Player"], makeDefault: true });
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetNPC, { types: ["NPC"], makeDefault: true });

  Items.registerSheet("shadowrun6-eden", SR6ItemSheet, { types: ["gear", "martialarttech", "martialartstyle", "quality", "spell", "adeptpower", "ritual", "metamagic", "focus"], makeDefault: true });

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
  Handlebars.registerHelper('gearSubtype', getSubtypes);
  Handlebars.registerHelper('ritualFeat', getRitualFeatures);
  Handlebars.registerHelper('spellFeat', getSpellFeatures);
  Handlebars.registerHelper('matrixPool', getMatrixActionPool);
  Handlebars.registerHelper('ifIn', function (elem, list, options) {
    if (list.indexOf(elem) > -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
	Handlebars.registerHelper('description', function (itemData, type) {
   	let key = type+"."+itemData.genesisID+".desc";
		let name= game.i18n.localize(key);
		if (name==key) {
			return "";
		}
		return name;
  });

  function onCreateItem(item, options, userId) {
    console.log("onCreateItem  "+item.data.type);
    let createData = item.data;
    if (createData.img == "icons/svg/item-bag.svg" && CONFIG.SR6.icons[createData.type]) {
      createData.img = CONFIG.SR6.icons[createData.type].default;
      item.update({ ["img"]: createData.img });
    }
    console.log("onCreateItem: " + createData.img);
  }

  Hooks.on("createItem", (doc, options, userId) => onCreateItem(doc, options, userId));


  Hooks.on('ready', () => {
    // Render a modal on click.
    $(document).on('click', diceIconSelector, ev => {
    console.log("diceIconSelector clicked");
      ev.preventDefault();
      // Roll and return
      let data = {
        pool: 0,
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
    dice3d.addSystem({ id: "SR6", name: "Shadowrun 6 - Eden" }, "default");
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
      visibility: 'hidden'
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

  Hooks.on('renderChatMessage', function (app, html, data) {
	 if (html.find("#chat-message")) {
	 	html.find("#chat-message").show(_onChatMessageAppear(this, app, html, data));
	 }
    html.find(".rollable").click(event => {
//      const type =  $(event.currentTarget).closestData("roll-type");
		const dataset = event.currentTarget.dataset;
      const rollType =  dataset.rollType;
		console.log("Clicked on rollable");
      if (rollType === "defense") {
        const targetId = $(event.currentTarget).closestData("targetid");
        console.log("Target "+targetId);
			const actor = game.actors.get(targetId);
		  const defendWith = dataset.defendWith;
			rollDefense(actor, defendWith);
      }
    });
    html.on("click", ".chat-edge", event => {
		 event.preventDefault();
	    let roll = $(event.currentTarget); 
	    let tip = roll.find(".chat-edge-collapsible");
	    if (!tip.is(":visible")) {
		    tip.slideDown(200);	
	    } else {
		    tip.slideUp(200);
	    }
		});
    html.on("click", ".chat-edge-post", event => {
		 event.preventDefault();
	    let roll = $(event.currentTarget.parentElement); 
 	    let tip = roll.find(".chat-edge-post-collapsible");
	    if (!tip.is(":visible")) {
		    tip.slideDown(200);	
	    } else {
		    tip.slideUp(200);
	    }
		});
    html.on("click", ".chat-spell", event => {
		 console.log("chat-spell");
		 event.preventDefault();
	    let roll = $(event.currentTarget); 
	    let tip = roll.find(".chat-spell-collapsible");
	    if (!tip.is(":visible")) {
		    tip.slideDown(200);	
	    } else {
		    tip.slideUp(200);
	    }
		});
  });

  /**
   * If a player actor is created, change default token settings
   */
  Hooks.on('preCreateActor', (actor, createData, options, userId) => {
    if (actor.type === 'Player') {
      actor.data.token.update({ "actorLink": "true" });
      actor.data.token.update({ "vision": "true" });
    }
  });

  Hooks.on('preUpdateCombatant', (combatant, createData, options, userId) => {
    console.log("Combatant with initiative "+createData.initiative);
  });

  Hooks.on('preUpdateCombat', (combat, createData, options, userId) => {
    console.log("Combat with turn "+createData.turn+" in round "+combat.data.round);
  });

  Hooks.on('deleteCombat', (combat, createData, userId) => {
    console.log("End Combat");
  });

  //  Hooks.on("modifyTokenAttribute", (attribute,value,isDelta,isBar,updates={}) => {
  //	console.log("Token modified "+attribute+" with "+value);
  //	const hp = getProperty(this.data.data, attribute);
  //  });

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

function getSubtypes(key) {
  if (CONFIG.SR6.GEAR_SUBTYPES.get(key)) {
    const myElem = CONFIG.SR6.GEAR_SUBTYPES.get(key);
    return myElem;
  } else {
    return [];
  }
};

function getRitualFeatures(ritual) {
  let ret = [];
  if (ritual.features.material_link) ret.push(game.i18n.localize("shadowrun6.ritualfeatures.material_link"));
  if (ritual.features.anchored) ret.push(game.i18n.localize("shadowrun6.ritualfeatures.anchored"));
  if (ritual.features.minion) ret.push(game.i18n.localize("shadowrun6.ritualfeatures.minion"));
  if (ritual.features.spell) ret.push(game.i18n.localize("shadowrun6.ritualfeatures.spell"));
  if (ritual.features.spotter) ret.push(game.i18n.localize("shadowrun6.ritualfeatures.spotter"));
  return ret.join(", ");
};
function getSpellFeatures(spell) {
  let ret = [];
  if (spell.features) {
    if (spell.features.area) ret.push(game.i18n.localize("shadowrun6.spellfeatures.area"));
    if (spell.features.direct) ret.push(game.i18n.localize("shadowrun6.spellfeatures.direct"));
    if (spell.features.indirect) ret.push(game.i18n.localize("shadowrun6.spellfeatures.indirect"));
    if (spell.features.sense_single) ret.push(game.i18n.localize("shadowrun6.spellfeatures.sense_single"));
    if (spell.features.sense_multi) ret.push(game.i18n.localize("shadowrun6.spellfeatures.sense_multi"));
  }
  return ret.join(", ");
};

function getMatrixActionPool(key, actor) {
	const action = CONFIG.SR6.MATRIX_ACTIONS[key];
	const skill  = actor.data.data.skills[action.skill];
	let pool = 0;
	if (skill) {
		pool = skill.pool;	
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

$.fn.closestData = function (dataName, defaultValue = "") {
  let value = this.closest(`[data-${dataName}]`)?.data(dataName);
  return (value) ? value : defaultValue;
}

/* -------------------------------------------- */
function _onChatMessageAppear(event, chatMsg, html, data) {
	console.log("Chat message appear - owner = "+chatMsg.isOwner);
	if (!chatMsg.isOwner) {
		console.log("I am not owner of that chat message from "+data.alias);		
		return;
	}
	 // React to changed edge boosts and actions
	 let boostSelect = html.find('.edgeBoosts');
    boostSelect.change(event => EdgeUtil.onEdgeBoostActionChange(event,"POST", chatMsg, html, data));
    boostSelect.keyup(event => EdgeUtil.onEdgeBoostActionChange(event,"POST", chatMsg, html, data));
    boostSelect.change(event => EdgeUtil.onEdgeBoostActionChange(event,"POST", chatMsg, html, data));
    boostSelect.keyup(event => EdgeUtil.onEdgeBoostActionChange(event,"POST", chatMsg, html, data));

	// chatMsg.roll is a SR6Roll
	let btnPerform = html.find('.edgePerform');
	if (btnPerform && chatMsg.roll.peformPostEdgeBoost) {
		btnPerform.click(chatMsg.roll.peformPostEdgeBoost.bind(this, chatMsg, html, data));
	}
}
