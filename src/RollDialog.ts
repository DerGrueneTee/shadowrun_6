import { Lifeform } from "./ActorTypes";
import { ItemRoll, PreparedRoll } from "./dice/RollTypes";
import { Gear, Spell, Weapon } from "./ItemTypes";

function isLifeform(obj: any): obj is Lifeform {
    return obj.attributes != undefined;
}
function isGear(obj: any): obj is Gear {
    return obj.skill != undefined;
}
function isWeapon(obj: any): obj is Weapon {
    return obj.attackRating != undefined;
}
function isSpell(obj: any): obj is Spell {
    return obj.drain != undefined;
}
function attackRatingToString(val : number[]) : string { 
	return val[0] + "/" +
      ((val[1] != 0) ? val[1] : "-") + "/" +
      ((val[2] != 0) ? val[2] : "-") + "/" +
      ((val[3] != 0) ? val[3] : "-") + "/" +
      ((val[4] != 0) ? val[4] : "-");
}
/**
 * Special Shadowrun 6 instance of the RollDialog
 */
export class RollDialog extends Dialog {
	
	html: JQuery;

	activateListeners(html: JQuery): void {
   	super.activateListeners(html);
		this.html = html;
	 // React to attack/defense rating changes
    html.find('.calc-edge').show(this._onCalcEdge.bind(this));
	/*
    if (!this.data.target) {
      html.find('.calc-edge').show(this._onNoTarget.bind(this));
    }
	*/
    html.find('.calc-edge-edit').change(this._onCalcEdge.bind(this));
    html.find('.calc-edge-edit').keyup(this._onCalcEdge.bind(this));
	 html.show(this._onCalcEdge.bind(this));

	 // React to changed edge boosts and actions
    html.find('.edgeBoosts').change(this._onEdgeBoostActionChange.bind(this));
    html.find('.edgeBoosts').keyup(this._onEdgeBoostActionChange.bind(this));
    html.find('.edgeActions').change(this._onEdgeBoostActionChange.bind(this));
    html.find('.edgeActions').keyup(this._onEdgeBoostActionChange.bind(this));
	 html.show(this._onEdgeBoostActionChange.bind(this));

	// React to changed amp up
    html.find('.ampUp').change(this._onSpellAmpUpChange.bind(this));

	// React to changed amp up
    html.find('.incArea').change(this._onSpellIncreaseAreaChange.bind(this));

	// React to changed amp up
    html.find('.fireMode').change(this._onFiringModeChange.bind(this));
  }

	//-------------------------------------------------------------
	/*
	 * Called when something edge gain relevant changes on the
	 * HTML form
	 */
	_onCalcEdge(event) {
		console.log("onCalcEdge ", this);

		let prepared : PreparedRoll = (this.options as any).prepared;	
	
   	try {
			let edgePlayer : number = 0;
			let edgeTarget : number = 0;
 
	   	// Check situational edge
	   	const situationA : HTMLInputElement | null = (document.getElementById("situationalEdgeA") as HTMLInputElement);
    		if (situationA && situationA.checked) {
					edgePlayer++;
	 		}
   		const situationD : HTMLInputElement | null = (document.getElementById("situationalEdgeD") as HTMLInputElement);
    		if (situationD && situationD.checked) {
				edgeTarget++;
	 		}

			const drElement : HTMLInputElement | null = (document.getElementById("dr") as HTMLInputElement);
			if (drElement) {
   			const dr = drElement.value;
      		const arModElem = document.getElementById("arMod");
/*   			if (this.data.data.rollType === "weapon") {
      			const arElement = document.getElementById("ar");
      			let ar = parseInt(arElement.children[arElement.selectedIndex].dataset.itemAr);
      			if (arModElem.value && parseInt(arModElem.value)!=0) {
						ar += parseInt(arModElem.value);
      			}
					this.data.data.attackRating = ar;
      			let result = ar - dr;
 			     	if (result >= 4) {
						this.data.edgePlayer++;
		   	   } else if (result <= -4) {
						this.data.edgeTarget++;
					}
			 	} else {
		 			let ar = this.data.data.attackRating;
		      	if (arModElem.value && parseInt(arModElem.value)!=0) {
						ar += parseInt(arModElem.value);
		      	}
		      	let result = ar - dr;
		      	if (result >= 4) {
						this.data.edgePlayer++;
		      	} else if (result <= -4) {
						this.data.edgeTarget++;
					}
				}
*/			}

	// Calculate effective edge
/*   let effective = this.data.edgePlayer - this.data.edgeTarget;
   if (effective>0) {
	   this.data.edgePlayer = this.data.edgePlayer - this.data.edgeTarget;
      this.data.edgeTarget = 0;
   } else if (effective<0) {
	   this.data.edgeTarget = this.data.edgeTarget - this.data.edgePlayer;
      this.data.edgePlayer = 0;
   } else {
      this.data.edgePlayer = 0;
      this.data.edgeTarget = 0;
   }
	// Set new edge value
   this.data.edge = Math.min(7,this.data.data.actor.data.data.edge.value + this.data.edgePlayer);
	this.data.data.edge = this.data.edge;
   // Update in dialog
	let edgeValue = this._element[0].getElementsByClassName("edge-value")[0];
	if (edgeValue) { 
	  	edgeValue.innerText = this.data.edge;
	}
	// Update selection of edge boosts
	this._updateEdgeBoosts(this._element[0].getElementsByClassName("edgeBoosts")[0], this.data.edge);
	let newEdgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when=="PRE" && boost.cost<=this.data.edge);

    // Prepare text for player
    let innerText = "";
    if (this.data.edgePlayer) {
		innerText = game.i18n.format("shadowrun6.roll.edge.gain_player", {name:this.data.data.speaker.alias, value:this.data.edgePlayer});
	 } else if (this.data.edgeTarget!=0) {
      let targetName = this.targetName ? this.targetName : game.i18n.localize("shadowrun6.roll.target");
		innerText += game.i18n.format("shadowrun6.roll.edge.gain_player", {name:targetName, value:this.data.edgeTarget});
	 } else {
		innerText += game.i18n.localize("shadowrun6.roll.edge.no_gain");
	}
	this.data.data.edge_message = innerText;
	
	 let edgeLabel = document.getElementById("edgeLabel");
	 if (edgeLabel) { 
	   edgeLabel.innerText = innerText;
	 }
*/	} catch (err) {
		console.log("Oh NO! "+err.stack);
	}
	
  }

	//-------------------------------------------------------------
	_updateEdgeBoosts(elem, available) {
		let newEdgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when=="PRE" && boost.cost<=available);

		// Node for inserting new data before		
		let insertBeforeElem = {};
		// Remove previous data
		var array = Array.from(elem.children);
		/*
		array.forEach( child => {
			if (child.value!="none" && child.value!="edge_action") {
				elem.removeChild(child)
			}
			if (child.value=="edge_action") {
				insertBeforeElem = child;
			}
		});
		
		// Add new data
		newEdgeBoosts.forEach( boost => {
			let opt = document.createElement("option");
			opt.setAttribute("value", boost.id);
			opt.setAttribute("data-item-boostid", boost.id);
			let cont = document.createTextNode(game.i18n.localize("shadowrun6.edge_boost."+boost.id)+" - ("+boost.cost+")");
			opt.appendChild(cont);
			elem.insertBefore(opt, insertBeforeElem);
		});
		*/
	}

	//-------------------------------------------------------------
	_updateEdgeActions(elem, available) {
		let newEdgeActions = CONFIG.SR6.EDGE_ACTIONS.filter(action => action.cost<=available);

		// Remove previous data
		var array = Array.from(elem.children);
		array.forEach( child => {
			/*
			if (child.value!="none") {
				elem.removeChild(child)
			}
					*/

		});
		
		// Add new data
		newEdgeActions.forEach( action => {
			let opt = document.createElement("option");
			opt.setAttribute("value", action.id);
			opt.setAttribute("data-item-actionid", action.id);
			let cont = document.createTextNode((game as Game).i18n.localize("shadowrun6.edge_action."+action.id)+" - ("+action.cost+")");
			opt.appendChild(cont);
			elem.appendChild(opt);
		});
	}
	
	//-------------------------------------------------------------
	/*
	 * Called when a change happens in the Edge Action or Edge Action
	 * selection.
	 */
	_onEdgeBoostActionChange(event) {
		console.log("_onEdgeBoostActionChange");

		/*
		// Ignore this, if there is no actor
		if (!this.data.data.actor) {
			return;
		}
		if (!event || !event.currentTarget) {
			return;
		}
		
		if (event.currentTarget.name === "edgeBoost") {
			const boostsSelect = event.currentTarget;
			let boostId = boostsSelect.children[boostsSelect.selectedIndex].dataset.itemBoostid;
			console.log(" boostId = "+boostId);
			this.data.data.edgeBoost = boostId;
		   if (boostId==="edge_action") {
				this._updateEdgeActions(this._element[0].getElementsByClassName("edgeActions")[0] , this.data.edge);
			} else {
				this._updateEdgeActions(this._element[0].getElementsByClassName("edgeActions")[0] , 0);
			}
			if (boostId!="none") {
				this.data.data.edge_use = game.i18n.localize("shadowrun6.edge_boost."+boostId)
			} else {
				this.data.data.edge_use="";
			}
			this._performEdgeBoostOrAction(this.data.data, boostId);
		} else if (event.currentTarget.name === "edgeAction") {
			const actionSelect = event.currentTarget;
			let actionId = actionSelect.children[actionSelect.selectedIndex].dataset.itemActionid;
			console.log(" actionId = "+actionId);
			this.data.data.edgeAction = actionId;
			this.data.data.edge_use = game.i18n.localize("shadowrun6.edge_action."+actionId)
			this._performEdgeBoostOrAction(this.data.data, actionId);
		}
				*/

	}

	//-------------------------------------------------------------
	_updateDicePool(data) {
		$("label[name='dicePool']")[0].innerText = parseInt(data.pool) + parseInt(data.modifier).toString();
	}
	
	//-------------------------------------------------------------
	_performEdgeBoostOrAction(data, boostOrActionId) {
		console.log("ToDo: performEgdeBoostOrAction "+boostOrActionId);
		if (boostOrActionId=="edge_action") {
			return;
		}
		
		data.explode = false;
		data.modifier = 0;
		/*
		switch (boostOrActionId) {
		case "add_edge_pool":
			data.explode = true;
			data.modifier = this.data.data.actor.data.data.edge.max;
			break;
		}	

		// Update content on dialog	
		$("input[name='modifier']")[0].value = data.modifier;
		$("input[name='explode' ]")[0].value = data.explode;
		$("input[name='explode' ]")[0].checked = data.explode;
		this._updateDicePool(data);
		
		*/
	}
	
	//-------------------------------------------------------------
	_onSpellAmpUpChange(event) {
		/*
		// Ignore this, if there is no actor
		if (!this.data.data.actor) {
			return;
		}
		if (!event || !event.currentTarget) {
			return;
		}
		
		if (event.currentTarget.name === "ampUp") {
			const ampUpSelect = Number.isNumeric(event.currentTarget.value) ? event.currentTarget.value : 0;
			this.data.data.damageMod = ampUpSelect*1;
			this.data.data.drainMod = ampUpSelect*2;
			console.log("Increase damage by "+this.data.data.damageMod+" and drain by "+this.data.data.drainMod);
		}
		*/
	}
	
	//-------------------------------------------------------------
	_onSpellIncreaseAreaChange(event) {
		/*
		// Ignore this, if there is no actor
		if (!this.data.data.actor) {
			return;
		}
		if (!event || !event.currentTarget) {
			return;
		}
		
		if (event.currentTarget.name === "incArea") {
			const incAreaSelect = Number.isNumeric(event.currentTarget.value) ? event.currentTarget.value : 0;
			this.data.data.radius = incAreaSelect*2;
			this.data.data.drainMod = incAreaSelect*1;
			console.log("Increase radius by "+this.data.data.radius+"m and drain by "+this.data.data.drainMod);
		}
		*/
	}
	
	//-------------------------------------------------------------
	_onFiringModeChange(event) {
		console.log("_onFiringModeChange ",this);
		let prepared : ItemRoll = (this.options as any).prepared;
		
		let newMode = event.currentTarget.value;
		console.log(" newMode "+newMode);
		let poolMod : number = 0;
		let arMod   : number = 0;
		let dmgMod  : number = 0;
		let rounds  : number = 1;
		switch (newMode) {
		case "SS":
			this.html.find('.onlyFA').css("display", "none");
			this.html.find('.onlyBF').css("display", "none");
			break;
		case "SA":
			console.log("Now BF");
			this.html.find('.onlyFA').css("display", "none");
			this.html.find('.onlyBF').css("display", "none");
			rounds = 2;
			arMod = -2;
			dmgMod = 1;
			break;
		case "BF":
			console.log("Now BF");
			this.html.find('.onlyFA').css("display", "none");
			this.html.find('.onlyBF').css("display", "table-cell");
			rounds = 4;
			arMod = -4;
			dmgMod = 2;
			break;			
		case "FA":
			console.log("Now GA");
			rounds = 10;
			arMod = -6;
			this.html.find('.onlyFA').css("display", "table-cell");
			this.html.find('.onlyBF').css("display", "none");
			break;			
		}
		
		// Calculate reduced attack rating
		prepared.calcAttackRating = [...prepared.weapon.attackRating];
		prepared.calcAttackRating.forEach( (element:number, index:number) => { 
			prepared.calcAttackRating[index]=element+arMod; 
			if (prepared.calcAttackRating[index]<=0) prepared.calcAttackRating[index]=0;
		});
		this.html.find("td[name='calcAR']").text( attackRatingToString(prepared.calcAttackRating) );
		// Update the range selector for attack rating
		this.html.find("select[name='attackRating']").children("option").each( function(){
			console.log("Child ", this);
			let idx = parseInt( this.getAttribute("name")! );
			this.setAttribute("data-item-ar", prepared.calcAttackRating[idx].toString() );
			this.setAttribute("value", prepared.calcAttackRating[idx].toString());
			this.text =  (game as Game).i18n.localize("shadowrun6.roll.ar_" + idx)+" (" + prepared.calcAttackRating[idx].toString() +")" ;
		});
		this.html.find("select[name='attackRating']").change();
		
		// Calculate modified damage
		prepared.calcDmg = prepared.weapon.dmg + dmgMod;
		this.html.find("span[name='calcDmg']").text( prepared.calcDmg.toString() );
		
		// Calculate modified pool
		prepared.calcPool = prepared.pool + poolMod;
		
		prepared.calcRounds = rounds;
		this.html.find("td[name='calcRounds']").text( prepared.calcRounds.toString() );
	}
	
  _onNoTarget() {
    document.getElementById("noTargetLabel")!.innerText = (game as Game).i18n.localize("shadowrun6.roll.notarget");
  }

}
