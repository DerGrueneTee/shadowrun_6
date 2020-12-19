import { SplittermondActorSheet } from "./Shadowrun6Actorsheet.js";
import { SplittermondActor} from "./Shadowrun6Actor.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function() {
  
    console.log(`Initializing Shadowrun 6 System`);

    // Define custom Entity classes
  CONFIG.Actor.entityClass = Shadowrun6Actor;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun6eden", Shadowrun6ActorSheet, { makeDefault: true });
  console.log(Actors.registeredSheets);
//   Items.unregisterSheet("core", ItemSheet);
 // Items.registerSheet("worldbuilding", SimpleItemSheet, { makeDefault: true });
  
}); 

