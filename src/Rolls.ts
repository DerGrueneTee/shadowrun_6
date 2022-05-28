import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import { Options } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll";
import { Lifeform, Skill, SR6Actor } from "./ActorTypes";
import { EdgeBoost, SkillDefinition } from "./DefinitionTypes";
import { Shadowrun6Actor } from "./Shadowrun6Actor";
import { RollDialog, SR6RollDialogOptions } from "./RollDialog.js";
import { Spell, Weapon } from "./ItemTypes";
import SR6Roll from "./SR6Roll.js";
import { ConfiguredRoll, WeaponRoll, PreparedRoll, ReallyRoll, RollType, SpellRoll } from "./dice/RollTypes.js";

function isLifeform(obj: any): obj is Lifeform {
	return obj.attributes != undefined;
}
function isWeapon(obj: any): obj is Weapon {
    return obj.attackRating != undefined;
}
function isSpell(obj: any): obj is Spell {
    return obj.drain != undefined;
}

export async function doRoll(data: PreparedRoll): Promise<SR6Roll> {
	console.log("ENTER doRoll ",data);
	try {
		// Create ll instance
		const _r: SR6Roll = await _showRollDialog(data);
		console.log("returned from _showRollDialog with ", _r);
		if (_r) {
			console.log("==============Calling toRoll() with ",data)
			_r.toMessage(data, {rollMode:data.rollMode});
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
	console.log("ENTER _showRollDialog", this);
	try {
		let lifeform : Lifeform|undefined;
		if (data.actor) {
			if (!isLifeform(data.actor.data.data)) {
				console.log("Actor is not a lifeform");
			}
			lifeform = (data.actor.data.data as Lifeform);
			data.edge = (data.actor) ? lifeform.edge.value : 0;
		}
		if (!data.calcPool || data.calcPool==0) {
			data.calcPool = data.pool;
		}
		
		/*
		 * Edge, Edge Boosts and Edge Actions
		 */
		data.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when == "PRE" && boost.cost <= data.edge);

		if (data.rollType==RollType.Weapon) {
			(data as WeaponRoll).calcPool = data.pool;
			(data as WeaponRoll).calcAttackRating = [...(data as WeaponRoll).weapon.attackRating];	
			(data as WeaponRoll).calcDmg = (data as WeaponRoll).weapon.dmg;
		}
		if (data.rollType==RollType.Spell && lifeform!=null) {
			(data as SpellRoll).calcDamage = lifeform.attributes.mag.pool/2;
		}

		// Render modal dialog
		let template: string = "systems/shadowrun6-eden/templates/chat/configurable-roll-dialog.html";
		let dialogData = {
			//checkText: data.extraText,
			data: data,
			CONFIG : CONFIG,
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
						callback: html => resolve(_dialogClosed(ReallyRoll.AUTOHITS, html[0].querySelector("form"), data))
					},
					normal: {
						icon: '<i class="fas fa-dice-six"></i>',
						label: (game as Game).i18n.localize("shadowrun6.rollType.normal"),
						callback: html => resolve(_dialogClosed(ReallyRoll.ROLL, html[0].querySelector("form"), data))
					}
				};
			} else {
				buttons = {
					normal: {
						icon: '<i class="fas fa-dice-six"></i>',
						label: (game as Game).i18n.localize("shadowrun6.rollType.normal"),
						callback: html => {
							console.log("doRoll: in callback");
							resolve(_dialogClosed(ReallyRoll.ROLL, html[0].querySelector("form"), data));
							console.log("end callback");
						}
					}
				};
			}
			const diagData: Dialog.Data = {
				title: title,
				content: html,
				render: html => {
					console.log("Register interactivity in the rendered dialog", this);
					// Set roll mode to default from chat window
					let chatRollMode : string = ($(".roll-type-select").val() as string);
					$("select[name='rollMode']").not(".roll-type-select").val(chatRollMode);
					},
				buttons: buttons,
				default: "normal",
			};
			
			// Also prepare a ConfiguredRoll
			let configured = new ConfiguredRoll();
			configured.copyFrom(data);
			
			const myDialogOptions ={
				width: 520,
				jQuery: true,
				resizeable : true,
				actor   : data.actor,
				prepared: data,
				configured : configured
			};
			console.log("create RollDialog");
			let dia2: RollDialog = new RollDialog(diagData, myDialogOptions);
			dia2.render(true);
			console.log("showRollDialog after render()");
		});

		return new Promise((resolve) => { });
	} finally {
		console.log("LEAVE _showRollDialog");
	}
}

function _dialogClosed(type: ReallyRoll, form:HTMLFormElement, data: PreparedRoll): SR6Roll {
	console.log("ENTER _dialogClosed(type=" + type + ", data=" , data , ")");
	try {
		
		let configured :ConfiguredRoll = (data as ConfiguredRoll);
		console.log("dialogClosed: configured=",configured);
		if (!configured.modifier) configured.modifier=0;
		
		if (data.actor) {
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
		}

		data.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when=="POST");

		let formula = "";
		let isPrivate : boolean = false;
	
	   if (form) {	
   	   data.threshold = (form.threshold)?parseInt(form.threshold.value):0;
      	configured.useWildDie = form.useWildDie.checked?1:0;
      	configured.explode = form.explode.checked;
	   	configured.buttonType = type;
      	configured.modifier = parseInt(form.modifier.value);
      	configured.defRating = (form.defRating)?parseInt(form.defRating.value):0;
			console.log("rollMode = ", form.rollMode.value);
			configured.rollMode = form.rollMode.value;

			formula = createFormula(configured);
			let base : number = configured.pool?configured.pool:0;
			let mod  : number = configured.modifier?configured.modifier:0;
			configured.pool = +base + +mod;
    	}
    
    // Execute the roll
		return new SR6Roll(formula, configured);
	} catch (err) {
		console.log("Oh NO! "+err.stack);
	} finally {
		console.log("LEAVE _dialogClosed()");
	}
	return this;
}

/*
 * Convert ConfiguredRoll into a Foundry roll formula
 */
function createFormula(roll:ConfiguredRoll) : string {
		console.log("createFormula-------------------------------");
	let regular : number = +(roll.pool?roll.pool:0) + (+roll.modifier?+roll.modifier:0);
	let wild    : number = 0;
	if (roll.useWildDie>0) {
		regular -= roll.useWildDie;
		wild     = roll.useWildDie;
	}
	
	let formula:string = `${regular}d6`;
	if (roll.explode) {
		 formula += 'x6';
	}
	formula += "cs>=5";
	
	if (wild>0) {
		formula += " + "+wild+"d6";
		if (roll.explode) {
			formula += 'x6';
		}
		formula += "cs>=5";
	}
	
	return formula;
}