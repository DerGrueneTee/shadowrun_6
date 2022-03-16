/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
import SR6Roll from "./SR6Roll.js";
import { registerSystemSettings } from "./settings.js";
import Shadowrun6Combat from "./Shadowrun6Combat.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";
import { SR6Config } from "./config.js";
import { Shadowrun6ActorSheetPC } from "./sheets/ActorSheetPC.js";
import { Shadowrun6ActorSheetNPC } from "./sheets/ActorSheetNPC.js";
import { Shadowrun6ActorSheetVehicle } from "./sheets/ActorSheetVehicle.js";
import { Shadowrun6ActorSheetCritter } from "./sheets/ActorSheetCritter.js";
//import { Shadowrun6ActorSheetVehicleCompendium } from "./sheets/ActorSheetVehicleCompendium.js";
import { SR6ItemSheet } from "./sheets/SR6ItemSheet.js";
import { CompendiumActorSheetNPC } from "./sheets/CompendiumActorSheetNPC.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { defineHandlebarHelper } from "./util/helper.js";
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
    registerSystemSettings();
    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetPC, { types: ["Player"], makeDefault: true });
    Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetNPC, { types: ["NPC"], makeDefault: true });
    Actors.registerSheet("shadowrun6-eden", CompendiumActorSheetNPC, { types: ["NPC"], makeDefault: false });
    Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetVehicle, { types: ["Vehicle"], makeDefault: true });
    Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetCritter, { types: ["Critter"], makeDefault: true });
    //Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetVehicleCompendium, { types: ["Vehicle"], makeDefault: false });
    Items.registerSheet("shadowrun6-eden", SR6ItemSheet, { types: ["gear", "martialarttech", "martialartstyle", "quality", "spell", "adeptpower", "ritual", "metamagic", "focus", "echo", "complexform", "sin", "contact", "lifestyle", "critterpower"], makeDefault: true });
    preloadHandlebarsTemplates();
    defineHandlebarHelper();
});
