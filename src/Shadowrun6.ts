
/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

import SR6Roll, { SR6RollChatMessage }  from "./SR6Roll.js";
import { registerSystemSettings } from "./settings.js";
import Shadowrun6Combat from "./Shadowrun6Combat.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";
import { SR6Config } from "./config.js";
import { Shadowrun6ActorSheet } from "./sheets/SR6ActorSheet.js";
import { Shadowrun6ActorSheetPC } from "./sheets/ActorSheetPC.js";
import { Shadowrun6ActorSheetNPC } from "./sheets/ActorSheetNPC.js";
import { Shadowrun6ActorSheetVehicle } from "./sheets/ActorSheetVehicle.js";
import { Shadowrun6ActorSheetCritter } from "./sheets/ActorSheetCritter.js";
//import { Shadowrun6ActorSheetVehicleCompendium } from "./sheets/ActorSheetVehicleCompendium.js";
import { SR6ItemSheet } from "./sheets/SR6ItemSheet.js";
import { CompendiumActorSheetNPC } from "./sheets/CompendiumActorSheetNPC.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { defineHandlebarHelper } from "./util/helper.js";
import { PreparedRoll } from "./dice/RollTypes.js";
import { doRoll } from "./Rolls.js";

const diceIconSelector : string = '#chat-controls .chat-control-icon .fa-dice-d20';

/**
 * Init hook. Called from Foundry when initializing the world
 */
Hooks.once("init", async function () {

  console.log(`Initializing Shadowrun 6 System`);

  CONFIG.debug.hooks = false;
  CONFIG.debug.dice = true;
  // Record Configuration Values
   // Record Configuration Values
  CONFIG.SR6 = new SR6Config;


  //CONFIG.ChatMessage.documentClass = SR6RollChatMessage;
  CONFIG.Combat.documentClass = Shadowrun6Combat;
  CONFIG.Actor.documentClass = Shadowrun6Actor;
  CONFIG.Dice.rolls = [SR6Roll, Roll];
  (game as Game).system.data.initiative = "@initiative.physical.pool + (@initiative.physical.dicePool)d6";

 	registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetPC, { types: ["Player"], makeDefault: true });
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetNPC, { types: ["NPC"], makeDefault: true });
  Actors.registerSheet("shadowrun6-eden", CompendiumActorSheetNPC, { types: ["NPC"], makeDefault: false });
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetVehicle, { types: ["Vehicle"], makeDefault: true });
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetCritter, { types: ["Critter"], makeDefault: true });
  //Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetVehicleCompendium, { types: ["Vehicle"], makeDefault: false });

  Items.registerSheet("shadowrun6-eden", SR6ItemSheet, { types: ["gear", "martialarttech", "martialartstyle", "quality", "spell", "adeptpower", "ritual", "metamagic", "focus", "echo", "complexform", "sin", "contact", "lifestyle","critterpower"], makeDefault: true });

  preloadHandlebarsTemplates();
  defineHandlebarHelper();

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
    dice3d.addDicePreset({
      type: "dc",
      labels: ["systems/shadowrun6-eden/images/EdgeToken.png","systems/shadowrun6-eden/images/EdgeToken.png"],
      bumpMaps: [,],
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

  Hooks.on('ready', () => {
    // Render a modal on click.
    $(document).on('click', diceIconSelector, ev => {
    console.log("diceIconSelector clicked  ",ev);
      ev.preventDefault();
      // Roll and return
		let roll : PreparedRoll = new PreparedRoll();
		roll.pool = 0;
      roll.speaker = ChatMessage.getSpeaker({ actor: this });
      doRoll(roll);
    });
  });

  Hooks.on('renderChatMessage', function (app, html, data) {
	 console.log("ENTER renderChatMessage");
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
	 console.log("LEAVE renderChatMessage");
  });

});
