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
	
	/** @overrride */
	getData() {
		let data = super.getData();
		//console.log("getData1() " , data);
		(data as SR6ActorSheetData).config = CONFIG.SR6;
		//console.log("getData2() " , data);
		//console.log("CONFIG.SR6 " , CONFIG.SR6);
		return data;
	}
	
}
