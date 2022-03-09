import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import { Options } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll";
import { Lifeform, Skill, SR6Actor } from "./ActorTypes";
import { EdgeBoost, SkillDefinition } from "./DefinitionTypes";
import { Shadowrun6Actor } from "./Shadowrun6Actor";
import { RollDialog } from "./RollDialog.js";
import { Spell } from "./ItemTypes";
import SR6Roll from "./SR6Roll.js";
import { ConfiguredRoll, PreparedRoll } from "./dice/RollTypes";

function isLifeform(obj: any): obj is Lifeform {
	return obj.attributes != undefined;
}

export async function doRoll(data: PreparedRoll): Promise<SR6Roll> {
	console.log("ENTER doRoll");
	try {

		// Create the Roll instance
		const _r: SR6Roll = await _showRollDialog(data);
		console.log("returned from _showRollDialog with ", _r);
		if (_r) {
			_r.toMessage(data);
		}

		return _r;
	} finally {
		console.log("LEAVE doRoll");
	}
}


//-------------------------------------------------------------
/**
 * @param data { PreparedRoll} Roll configuration from the UI
 * @return {Promise<Roll>}
 * @private
 */
async function _showRollDialog(data: PreparedRoll): Promise<SR6Roll> {
	console.log("ENTER _showRollDialog", data);
	try {
		if (!isLifeform(data.actor.data.data)) {
			console.log("Actor is not a lifeform");
		}
		let lifeform: Lifeform = (data.actor.data.data as Lifeform);

		/*
		 * Edge, Edge Boosts and Edge Actions
		 */
		//data.actor = (game as Game).actors.get(data.speaker.actor);
		data.edge = (data.actor) ? lifeform.edge.value : 0;
		data.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when == "PRE" && boost.cost <= data.edge);

		/*
	  if (data.targetId && data.rollType === "weapon") {
		data.targetName = game.actors.get(data.targetId).name;
		data.extraText = game.i18n.localize("shadowrun6.roll.attack") + " " + data.targetName + " " + game.i18n.localize("shadowrun6.roll.with") + " " + data.item.name;
		data.defRating = game.actors.get(data.targetId).data.data.derived.defense_rating.pool;
	  } else if (data.targetId && data.rollType === "spell") {
		data.extraText = " Spell targeting not implemented yet ";
	  }
		*/
		// Render modal dialog
		let template: string = "systems/shadowrun6-eden/templates/chat/configurable-roll-dialog.html";
		let dialogData = {
			//checkText: data.extraText,
			data: data,
			rollModes: CONFIG.Dice.rollModes,
		};
		const html: string = await renderTemplate(template, dialogData);
		const title = data.title;

		// Create the Dialog window
		return new Promise(resolve => {

			console.log("_showRollDialog prepared buttons");
			let buttons;
			if (data.allowBuyHits) {
				buttons = {
					bought: {
						icon: '<i class="fas fa-dollar-sign"></i>',
						label: (game as Game).i18n.localize("shadowrun6.rollType.bought"),
						callback: html => resolve(_dialogClosed(1, html[0].querySelector("form"), data))
					},
					normal: {
						icon: '<i class="fas fa-dice-six"></i>',
						label: (game as Game).i18n.localize("shadowrun6.rollType.normal"),
						callback: html => resolve(_dialogClosed(0, html[0].querySelector("form"), data))
					}
				};
			} else {
				buttons = {
					normal: {
						icon: '<i class="fas fa-dice-six"></i>',
						label: (game as Game).i18n.localize("shadowrun6.rollType.normal"),
						callback: html => {
							console.log("in callback");
							resolve(_dialogClosed(0, html[0].querySelector("form"), data));
							console.log("end callback");
						}
					}
				};
			}
			const diagData: Dialog.Data = {
				title: title,
				content: html,
				render: html => console.log("Register interactivity in the rendered dialog"),
				buttons: buttons,
				default: "normal",
			};
			const myDialogOptions = {
				width: 480,
				jQuery: true,
				prepared: data,
			};
			console.log("create RollDialog");
			let dia2: RollDialog = new RollDialog(diagData, myDialogOptions);
			dia2.render(true);
		});

		return new Promise((resolve) => { });
	} finally {
		console.log("LEAVE _showRollDialog");
	}
}


function _dialogClosed(type: number, form, data: PreparedRoll, messageData = {}): SR6Roll {
	console.log("ENTER _dialogClosed(type=" + type + ", form=" + form + ", data=" + data + ")");
	try {
		console.log("data = ", data);
		console.log("messageData = ", messageData);
		
		let configured :ConfiguredRoll = (data as ConfiguredRoll);
		if (!isLifeform(data.actor.data.data))
			throw new Error("Not a lifeform");

	// Pay eventuallly selected edge boost
	if (configured.edgeBoost && configured.edgeBoost!="none") {
		console.log("Edge Boost selected: "+configured.edgeBoost);
		if (configured.edgeBoost === "edge_action") {
			console.log("ToDo: handle edge action");
		} else {
			let boost:EdgeBoost = CONFIG.SR6.EDGE_BOOSTS.find(boost => boost.id==configured.edgeBoost)!;
			console.log("Pay "+boost.cost+" egde for Edge Boost: "+(game as Game).i18n.localize("shadowrun6.edge_boost."+configured.edgeBoost));
			data.actor.data.data.edge.value = data.edge - boost.cost;
			// Pay Edge cost
			data.actor.update({ ["data.edge.value"]: data.actor.data.data.edge.value });
		}
	} else {
		if (data.edge>0) {
			data.actor.update({ ["data.edge.value"]: data.edge });
		}
	}
	

    data.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when=="POST");


    if (form) {	
      data.threshold = (form.threshold)?parseInt(form.threshold.value):0;
      data.useWildDie = form.useWildDie.checked;
	   
/*      data.modifier = parseInt(form.modifier.value);
      data.defRating = (form.defRating)?parseInt(form.defRating.value):0;
	   if (data.spell && data.spell.type=="ritual") {
			data.threshold = data.spell.data.data.threshold;
		}
      data.explode = form.explode.checked;
      data.buttonType = type;
      data.rollMode = form.rollMode.value;
      messageData.rollMode = form.rollMode.value;
      data.weapon = data.item ? true : false;
      if (data.modifier > 0) {
        data.formula = data.pool + " + " + data.modifier + "d6";
      } else if (data.modifier < 0){
        data.formula = data.pool + " " + data.modifier + "d6";
      } else {
        data.formula = data.pool + "d6";
      }
*/
    }

/*	if (data.rollType=="spell") {
		if (data.spell) {
			data.drain  = parseInt(data.spell.data.data.drain);	
			data.radius = (data.spell.data.data.range == "line_of_sight_area" || data.spell.data.data.range == "self_area") ? 2 : 0;
			if (data.spell.data.data.category == "combat") {
				data.damage = ( data.spell.data.data.type == "mana" ) ? 0 : data.actor.data.data.attributes.mag.pool/2;
				data.drain  = parseInt(data.spell.data.data.drain);	
				// Amp up
				if (data.damageMod) {
					data.damage+= parseInt(data.damageMod);
				}
			}
				// Increase area
				if (data.radiusMod) {
					data.radius+= data.radiusMod;
				}
				
			if (data.drainMod) {
				data.drain+= parseInt(data.drainMod);
			}
		}
	} else if (data.rollType=="weapon") {
		if (data.item) {
			// TODO: Evaluate fire modes
			console.log("ToDo: evaluate fire modes, called shots, etc.")
			data.damage = data.item.data.data.dmg;
			data.dmgDef = data.item.data.data.dmgDef;
		}
	}
*/
    
		console.log("BEFORE");
		let r = new Roll("2d6 + 4 + 1d4");
 		console.log("1: ",r);
    	r.evaluate();
 		console.log("2: ",r);
     	console.log(r.result); // 5 + 4 + 2
    // Execute the roll
		return new SR6Roll("3d6", configured);
	} finally {
		console.log("LEAVE _dialogClosed()");
	}
}
