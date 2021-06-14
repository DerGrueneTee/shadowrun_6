import SR6Roll from "./sr6_roll.js"
export async function doRoll(data, messageData = {}) {
  messageData.flavor = "<h2>" + data.title + "</h2>";
  messageData.speaker = ChatMessage.getSpeaker();
  messageData.targetId = data.targetId;
	console.log("doRoll: data.speaker="+data.speaker.name+"  \n"+messageData.speaker.name);

  // Define the inner roll function
  const _roll = (type, form, data) => {
    console.log("START: _roll(type="+type+", form="+form+", data="+data+")");
    if (form) {
      data.modifier = parseInt(form.modifier.value);
      data.threshold = (form.threshold)?parseInt(form.threshold.value):0;
      data.explode = form.explode.checked;
      data.useWildDie = form.wilddie.checked;
      data.type = type;
      messageData.rollMode = form.rollMode.value;
      data.weapon = data.item ? true : false;
      if (data.modifier > 0) {
        data.formula = data.value + " + " + data.modifier + "d6";
      } else {
        data.formula = data.value + "d6";
      }
    }

    // Execute the roll
    let r = new SR6Roll("", data);
    try {
	   console.log("Call r.evaluate: "+r);
      r.evaluate();
    } catch (err) {
      console.error("CommonRoll error: "+err);
      ui.notifications.error(`Dice roll evaluation failed: ${err.message}`);
      return null;
    }
    return r;
  }

  // Create the Roll instance
  console.log("call _attackRollDialog");
  const _r = await _attackRollDialog({ data, foo: _dialogClosed });
  console.log("returned from _attackRollDialog with "+_r);
  if (_r) {
    _r.toMessage(messageData);
  }
  return _r;
}

/**
 * @return {Promise<Roll>}
 * @private
 */
async function _attackRollDialog({ data, foo } = {}) {
  console.log("in _attackRollDialog");

  if (isNaN(data.threshold)) {
    data.threshold = 0;
  }
  if (isNaN(data.explode)) {
    data.explode = false;
  }

  if (isNaN(data.modifier)) {
    data.modifier = 0;
  }

  data.defRating = 0;

	/*
	 * Fill dialog head
	 */
	if (data.attackType === "weapon") {
		if (data.targetId) {
    		data.actionText = game.i18n.localize("shadowrun6.roll.attack") + " " + data.targetName + " " + game.i18n.localize("shadowrun6.roll.with") + " " + data.item.name;
		} else {
    		data.actionText = game.i18n.localize("shadowrun6.roll.attack") + " " + game.i18n.localize("shadowrun6.roll.with") + " " + data.item.name;
		}
		data.checkText = 
			game.i18n.localize("skill."+data.item.data.data.skill) +"/" + 
			game.i18n.localize("shadowrun6.special."+data.item.data.data.skill+"."+data.item.data.data.skillSpec) + " + " +
			game.i18n.localize("attrib."+CONFIG.SR6.ATTRIB_BY_SKILL.get(data.item.data.data.skill).attrib);
	}

	/*
	 * Edge, Edge Boosts and Edge Actions
	 */
    data.actor = game.actors.get(data.speaker.actor);
    data.edge = (data.actor)?data.actor.data.data.edge.value:0;
    data.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when=="PRE" && boost.cost<=data.edge);
	 

  if (data.targetId && data.attackType === "weapon") {
    data.targetName = game.actors.get(data.targetId).name;
    data.extraText = game.i18n.localize("shadowrun6.roll.attack") + " " + data.targetName + " " + game.i18n.localize("shadowrun6.roll.with") + " " + data.item.name;
    data.defRating = game.actors.get(data.targetId).data.data.derived.defense_rating.pool;
  } else if (data.targetId && data.attackType === "spell") {
    data.extraText = " Spell targeting not implemented yet ";
  }
  // Render modal dialog
//  let template = "systems/shadowrun6-eden/templates/chat/roll-attack-dialog.html";
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
          callback: html => resolve(foo(1, html[0].querySelector("form"), data))
        },
        normal: {
	       icon: '<i class="fas fa-dice-six"></i>',
          label: game.i18n.localize("shadowrun6.rollType.normal"),
          callback: html => resolve(foo(0, html[0].querySelector("form"), data))
        }
      };
    } else {
      buttons = {
        normal: {
	       icon: '<i class="fas fa-dice-six"></i>',
          label: game.i18n.localize("shadowrun6.rollType.normal"),
          callback: html => {
				console.log("in callback");
				resolve(foo(0, html[0].querySelector("form"), data));
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
}

function _dialogClosed(type, form, data, messageData={}) {
    console.log("START: _dialogClosed(type="+type+", form="+form+", data="+data+")");
    if (form) {
      data.modifier = parseInt(form.modifier.value);
      data.threshold = (form.threshold)?parseInt(form.threshold.value):0;
      data.explode = form.explode.checked;
      data.useWildDie = form.wilddie.checked;
      data.type = type;
      messageData.rollMode = form.rollMode.value;
      data.weapon = data.item ? true : false;
      if (data.modifier > 0) {
        data.formula = data.value + " + " + data.modifier + "d6";
      } else {
        data.formula = data.value + "d6";
      }
    }

    // Execute the roll
    let r = new SR6Roll("", data);
    try {
	   console.log("Call r.evaluate: "+r);
      r.evaluate();
    } catch (err) {
      console.error("CommonRoll error: "+err);
      ui.notifications.error(`Dice roll evaluation failed: ${err.message}`);
      return null;
    }
    return r;
 }


export class RollDialog extends Dialog {

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.calc-edge').show(this._onCalcEdge.bind(this));
    if (!this.data.target) {
      html.find('.calc-edge').show(this._onNoTarget.bind(this));
    }
    html.find('.calc-edge-edit').change(this._onCalcEdge.bind(this));
    html.find('.calc-edge-edit').keyup(this._onCalcEdge.bind(this));
	 html.show(this._onCalcEdge.bind(this));
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

    if (this.data.attackType === "weapon") {
      const arElement = document.getElementById("ar");
      const drElement = document.getElementById("dr");
      const arModElem = document.getElementById("arMod");
      const dr = drElement.value;
      let ar = parseInt(arElement.children[arElement.selectedIndex].dataset.itemAr);
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
    this.data.edge = this.data.data.actor.data.data.edge.value + this.data.edgePlayer;

    // Prepare text for player
    let innerText = "";
    if (this.data.edgePlayer) {
		innerText = game.i18n.format("shadowrun6.roll.edge.gain_player", {name:this.data.data.speaker.alias, value:this.data.edgePlayer});
	 }
    if (this.data.edgeTarget!=0) {
      let targetName = this.targetName ? this.targetName : game.i18n.localize("shadowrun6.roll.target");
		innerText += "\n"+game.i18n.format("shadowrun6.roll.edge.gain_player", {name:targetName, value:this.data.edgeTarget});
	 }
	
	 let edgeLabel = document.getElementById("edgeLabel");
	 if (edgeLabel) { 
	   edgeLabel.innerText = innerText;
	 }
	} catch (err) {
		console.log("Oh NO! "+err.stack);
	}
  }

  _onNoTarget() {
    document.getElementById("noTargetLabel").innerText = game.i18n.localize("shadowrun6.roll.notarget");
  }
}