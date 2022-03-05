import { Lifeform } from "../ActorTypes.js";
import { SR6Config } from "../config.js";
import { Shadowrun6Actor } from "../Shadowrun6Actor.js";

interface SR6ActorSheetData extends ActorSheet.Data {
	config:SR6Config;
}


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
 export class Shadowrun6ActorSheet extends ActorSheet {
	
}
