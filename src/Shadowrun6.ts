
/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

import { registerSystemSettings } from "./settings.js";
import Shadowrun6Combat from "./Shadowrun6Combat.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";
import { SR6, SR6Config } from "./config.js";
import { Shadowrun6ActorSheet } from "./sheets/SR6ActorSheet.js";
import { Shadowrun6ActorSheetPC } from "./sheets/ActorSheetPC.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { defineHandlebarHelper } from "./util/helper.js";

declare global {
    interface CONFIG {
        SR6: SR6Config
    }
}

/**
 * Init hook. Called from Foundry when initializing the world
 */
Hooks.once("init", async function () {

  console.log(`Initializing Shadowrun 6 System`);
	
  CONFIG.debug.hooks = false;
  // Record Configuration Values
   // Record Configuration Values
  CONFIG.SR6 = SR6;


  CONFIG.Combat.documentClass = Shadowrun6Combat;
  CONFIG.Actor.documentClass = Shadowrun6Actor;

 	registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetPC, { types: ["Player"], makeDefault: true });

  preloadHandlebarsTemplates();
  defineHandlebarHelper();
});
