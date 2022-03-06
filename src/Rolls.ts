import { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import { Options } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll";
import { Lifeform, Skill } from "./ActorTypes";
import { EdgeBoost } from "./DefinitionTypes";
import { Shadowrun6Actor } from "./Shadowrun6Actor";
import { RollDialog } from "./RollDialog.js";

function isLifeform(obj: any): obj is Lifeform {
    return obj.attributes != undefined;
}

export async function doRoll(data:PreparedRoll): Promise<Roll> {
	console.log("ENTER doRoll");

	// Create the Roll instance
	const _r = await _showRollDialog(data);
	console.log("returned from _showRollDialog with ",_r);
	if (_r) {
  		//delete data.type;
   	_r.toMessage(data);
  	}
  	console.log("LEAVE doRoll");
  	return _r;
}


//-------------------------------------------------------------
/**
 * @param data { PreparedRoll} Roll configuration from the UI
 * @return {Promise<Roll>}
 * @private
 */
async function _showRollDialog(data:PreparedRoll) : Promise<Roll> {
  console.log("ENTER _showRollDialog" , data);

	if (!isLifeform(data.actor.data.data)) {
  		console.log("Actor is not a lifeform");
	}
	let lifeform : Lifeform = (data.actor.data.data as Lifeform);
	
	/*
	 * Edge, Edge Boosts and Edge Actions
	 */
   //data.actor = (game as Game).actors.get(data.speaker.actor);
     data.edge = (data.actor)?lifeform.edge.value:0;
    data.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when=="PRE" && boost.cost<=data.edge);
	 
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
  let template:string = "systems/shadowrun6-eden/templates/chat/configurable-roll-dialog.html";
  let dialogData = {
	 //checkText: data.extraText,
    data: data,
    rollModes: CONFIG.Dice.rollModes,
  };
  const html:string = await renderTemplate(template, dialogData);
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
	const diagData:Dialog.Data = {
      title: title,
      content: html,
      render: html => console.log("Register interactivity in the rendered dialog"),
      buttons: buttons,
      default: "normal",
	};
	const myDialogOptions = {
		width: 480,
		jQuery  : true,
      prepared: data,
	  };
  		console.log("create RollDialog");
		let dia2 : RollDialog = new RollDialog(diagData, myDialogOptions);
		dia2.render(true);
	});

  console.log("LEAVE _showRollDialog");
	return new Promise(  (resolve) => {});
}


function _dialogClosed(type:number, form, data:PreparedRoll, messageData={}) : SR6Roll {
    console.log("ENTER _dialogClosed(type="+type+", form="+form+", data="+data+")");
    console.log("data = ",data);
    console.log("messageData = ",messageData);

	let configured : ConfiguredRollData = new ConfiguredRollData(data);

	return new SR6Roll("3d6");
}

/**
 * The data fro a roll known before presenting a roll dialog
 */
export class PreparedRoll {
	speaker : ChatSpeakerDataProperties;
	actor   : Shadowrun6Actor;
	
	/* Suggested Window title */
	title   : string;
	/**
	 * Text to describe what is happening.
	 * e.g. <i>X is shooting at Y</i>
	 */
	actionText : string;
	/** Describe what is being rolled */
	checkText  : string;
	
	threshold : number = 3;
	useThreshold : boolean;
	/* How many dice shall be rolled */
	pool : number ;
	allowBuyHits  : boolean ;
	/* Does this check generate a free edge */
	freeEdge :boolean;
	/* Available edge */
	edge     : number;
    edgeBoosts: EdgeBoost[];
	
	
	isOpposed    : boolean;
	defendWith   : string | undefined;
	
	
}

export class SkillRoll extends PreparedRoll {
	skill     : Skill;
	skillId   : string;
	skillSpec : string;
	attrib    : string | undefined ;
	
	/**
	 * @param skill {Skill}   The skill to roll upon
	 */
	constructor(skill:Skill, skillId:string) {
		super();
		this.skill = skill;
		this.skillId = skillId;
	}
	
	/**
	 * Execute
	 */
	prepare(actor:Shadowrun6Actor) : void {
		
	}
}

export class SpellRoll extends SkillRoll {
	canAmpUpSpell  : boolean;
	canIncreaseArea: boolean;
	
	/**
	 * @param skill {Skill}   The skill to roll upon
	 */
	constructor(skill:Skill, skillId:string) {
		super(skill, skillId);
	}
}

export interface TargetRoll {
	
}



class ConfiguredRollData {
	prepared:PreparedRoll;
	
	constructor(prepared:PreparedRoll) {
		this.prepared = prepared;
	}
}

class SR6Roll extends Roll<ConfiguredRollData> {

  static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
  static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

  constructor(formula: string, data?: ConfiguredRollData, options?: Roll['options']) {
    super(formula, data, options);
  }
}