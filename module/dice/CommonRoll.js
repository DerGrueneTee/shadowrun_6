import SR6Roll from "./sr6_roll.js"

//-------------------------------------------------------------
/**
 * Called from Shadowrun6Actor.js
 */
export async function doRoll(data) {
	console.log("ENTER doRoll");

	// Create the Roll instance
	const _r = await _showRollDialog(data, _dialogClosed);
	console.log("returned from _showRollDialog with "+_r);
	if (_r) {
  		delete data.type;
   	_r.toMessage(data);
  	}
  	console.log("LEAVE doRoll");
  	return _r;
}

//-------------------------------------------------------------
/**
 * @return {Promise<Roll>}
 * @private
 */
async function _showRollDialog(data, onClose={}) {
  console.log("ENTER _showRollDialog");

  if (isNaN(data.threshold)) {
    data.threshold = 0;
  }
  if (isNaN(data.explode)) {
    data.explode = false;
  }

  if (isNaN(data.modifier)) {
    data.modifier = 0;
  }

	if (!data.defRating) {
		data.defRating = 0;
	}

	/*
	 * Edge, Edge Boosts and Edge Actions
	 */
    data.actor = game.actors.get(data.speaker.actor);
    data.edge = (data.actor)?data.actor.data.data.edge.value:0;
    data.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when=="PRE" && boost.cost<=data.edge);
	 

  if (data.targetId && data.rollType === "weapon") {
    data.targetName = game.actors.get(data.targetId).name;
    data.extraText = game.i18n.localize("shadowrun6.roll.attack") + " " + data.targetName + " " + game.i18n.localize("shadowrun6.roll.with") + " " + data.item.name;
    data.defRating = game.actors.get(data.targetId).data.data.derived.defense_rating.pool;
  } else if (data.targetId && data.rollType === "spell") {
    data.extraText = " Spell targeting not implemented yet ";
  }
  // Render modal dialog
  let template = "systems/shadowrun6-eden/templates/chat/configurable-roll-dialog.html";
  let dialogData = {
	 checkText: data.extraText,
    data: data,
    rollModes: CONFIG.Dice.rollModes,
  };
  const html = await renderTemplate(template, dialogData);
  const title = data.title;

  // Create the Dialog window
  return new Promise(resolve => {

    let buttons;
    if (data.buyHits) {
      buttons = {
        bought: {
	       icon: '<i class="fas fa-dollar-sign"></i>',
          label: game.i18n.localize("shadowrun6.rollType.bought"),
          callback: html => resolve(onClose(1, html[0].querySelector("form"), data))
        },
        normal: {
	       icon: '<i class="fas fa-dice-six"></i>',
          label: game.i18n.localize("shadowrun6.rollType.normal"),
          callback: html => resolve(onClose(0, html[0].querySelector("form"), data))
        }
      };
    } else {
      buttons = {
        normal: {
	       icon: '<i class="fas fa-dice-six"></i>',
          label: game.i18n.localize("shadowrun6.rollType.normal"),
          callback: html => {
				console.log("in callback");
				resolve(onClose(0, html[0].querySelector("form"), data));
				console.log("end callback");
			}
        }
      };
    }
  console.log("create RollDialog");
    let x =  new RollDialog({
      title: title,
      content: html,
      target: data.targetId ? true : false,
      targetName: data.targetName,
      buttons: buttons,
      default: "normal",
      data: data,
      attackType: data.attackType,
      render: html => console.log("Register interactivity in the rendered dialog"),
      close: () => resolve(null)
    }).render(true);
  });
  console.log("LEAVE _showRollDialog");
}

function _dialogClosed(type, form, data, messageData={}) {
    console.log("ENTER _dialogClosed(type="+type+", form="+form+", data="+data+")");
	 // Delete some fields that where only necessary for the roll dialog
    delete data.canAmpUpSpell;
	 delete data.canIncreaseArea;
	 delete data.canModifySpell;
    delete data.edgeBoosts;
	// For simple tests use the text describing the test
	// as action text
	 if (!data.actionText) {
		data.actionText = data.checkText;
	}

	// Pay eventuallly selected edge boost
	if (data.edgeBoost && data.edgeBoost!="none") {
		console.log("Edge Boost selected: "+data.edgeBoost);
		if (data.edgeBoost === "edge_action") {
			console.log("ToDo: handle edge action");
		} else {
			let boost = CONFIG.SR6.EDGE_BOOSTS.find(boost => boost.id==data.edgeBoost);
			console.log("Pay "+boost.cost+" egde for Edge Boost: "+game.i18n.localize("shadowrun6.edge_boost."+data.edgeBoost));
			data.actor.data.data.edge.value = data.edge - boost.cost;
			// ToDo Anja: Roll cost dice coins here
			data.actor.update({ ["data.edge.value"]: data.actor.data.data.edge.value });
		}
	} else {
		if (data.edge>0) {
			data.actor.update({ ["data.edge.value"]: data.edge });
		}
	}
	

    data.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when=="POST");


    if (form) {
      data.modifier = parseInt(form.modifier.value);
      data.defRating = (form.defRating)?parseInt(form.defRating.value):0;
      data.threshold = (form.threshold)?parseInt(form.threshold.value):0;
      data.explode = form.explode.checked;
      data.useWildDie = form.useWildDie.checked;
      data.buttonType = type;
      data.rollMode = form.rollMode.value;
      messageData.rollMode = form.rollMode.value;
      data.weapon = data.item ? true : false;
      if (data.modifier > 0) {
        data.formula = data.pool + " + " + data.modifier + "d6";
      } else {
        data.formula = data.pool + "d6";
      }
    }

	if (data.rollType=="spell") {
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
		}
	}

    
    // Execute the roll
    let r = new SR6Roll("", data);
    try {
	   console.log("Call r.evaluate: "+r);
      r.evaluate();
		if (data.spell && data.spell.data.data.category=="combat" && data.spell.data.data.type == "mana") {
			data.damage += r._total;
		}
    } catch (err) {
      console.error("CommonRoll error: "+err);
      console.error("CommonRoll error: "+err.stack);
      ui.notifications.error(`Dice roll evaluation failed: ${err.message}`);
    console.log("LEAVE _dialogClosed(type="+type+", form="+form+", data="+data+")");
      return null;
    }
    console.log("LEAVE _dialogClosed(type="+type+", form="+form+", data="+data+")");
    return r;
 }

export function rollDefense(actor, defendWith) {
	console.log("ENTER rollDefense(actor="+actor+", defendWith="+defendWith+")");
	let actionText = "";
	let checkText  = "";
	let defense = {};
	switch (defendWith) {
	case "physical":
		defense = actor.data.data.defensepool.physical;
		actionText = game.i18n.format("shadowrun6.roll.defense.physical");
		checkText  = game.i18n.localize("attrib.rea")+" + "+game.i18n.localize("attrib.int");
		break;
	}
	console.log("LEAVE rollDefense");
	
}

export class RollDialog extends Dialog {

  activateListeners(html) {
    super.activateListeners(html);
	 // React to attack/defense rating changes
    html.find('.calc-edge').show(this._onCalcEdge.bind(this));
    if (!this.data.target) {
      html.find('.calc-edge').show(this._onNoTarget.bind(this));
    }
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
  }

	//-------------------------------------------------------------
	/*
	 * Called when something edge gain relevant changes on the
	 * HTML form
	 */
  _onCalcEdge(event) {
	 console.log("onCalcEdge");
    try {
		// Ignore this, if there is no actor
		if (!this.data.data.actor) {
			return;
		}
	
    this.data.edgePlayer = 0;
    this.data.edgeTarget = 0;

    // Check situational edge
    const situationA = document.getElementById("situationalEdgeA");
    if (situationA && situationA.checked) {
			this.data.edgePlayer++;
	 }
    const situationD = document.getElementById("situationalEdgeD");
    if (situationD && situationD.checked) {
			this.data.edgeTarget++;
	 }

	const drElement = document.getElementById("dr");
	if (drElement) {
   	const dr = drElement.value;
      const arModElem = document.getElementById("arMod");
   	if (this.data.data.rollType === "weapon") {
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
	}

	// Calculate effective edge
   let effective = this.data.edgePlayer - this.data.edgeTarget;
   if (effective>0) {
	   this.data.edgePlayer = this.data.edgePlayer - this.data.edgeTarget;
      this.data.edgeTarget = 0;
   } else if (effective<0) {
	   this.data.edgePlayer = this.data.edgeTarget - this.data.edgePlayer;
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
	} catch (err) {
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
	}

	//-------------------------------------------------------------
	_updateEdgeActions(elem, available) {
		let newEdgeActions = CONFIG.SR6.EDGE_ACTIONS.filter(action => action.cost<=available);

		// Remove previous data
		var array = Array.from(elem.children);
		array.forEach( child => {
			if (child.value!="none") {
				elem.removeChild(child)
			}
		});
		
		// Add new data
		newEdgeActions.forEach( action => {
			let opt = document.createElement("option");
			opt.setAttribute("value", action.id);
			opt.setAttribute("data-item-actionid", action.id);
			let cont = document.createTextNode(game.i18n.localize("shadowrun6.edge_action."+action.id)+" - ("+action.cost+")");
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
	}

	//-------------------------------------------------------------
	_updateDicePool(data) {
		$("label[name='dicePool']")[0].innerText = parseInt(data.pool) + parseInt(data.modifier);
	}
	
	//-------------------------------------------------------------
	_performEdgeBoostOrAction(data, boostOrActionId) {
		console.log("ToDo: performEgdeBoostOrAction "+boostOrActionId);
		if (boostOrActionId=="edge_action") {
			return;
		}
		
		data.explode = false;
		data.modifier = 0;
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
		
	}
	
	//-------------------------------------------------------------
	_onSpellAmpUpChange(event) {
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
	}
	
	//-------------------------------------------------------------
	_onSpellIncreaseAreaChange(event) {
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
	}
	
  _onNoTarget() {
    document.getElementById("noTargetLabel").innerText = game.i18n.localize("shadowrun6.roll.notarget");
  }
}