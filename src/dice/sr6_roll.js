
export default class SR6Roll extends Roll {

  static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
  static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

  constructor(...args) {
    super(...args);
    this.data = args[1];
    this.p = {};
    this.results = {};
  }

  /** @override */
  evaluate() {
	 console.log("ENTER evaluate()");
    let data = this.data;
    let noOfDice = parseInt(data.pool);
    let die;
    noOfDice += data.modifier;

    if (noOfDice < 0) {
      noOfDice = 0;
    }
    let formula = "";
    if (data.buttonType == 0) {
      if (this.data.useWildDie) {
        formula = this.createFormula(1, -1, data.explode);
        if (noOfDice - 1 > 0) {
          formula += "+" + this.createFormula(noOfDice - 1, -1, data.explode);
        }
      } else {
        formula = this.createFormula(noOfDice, -1, data.explode);
      }
      die = new Roll(formula).evaluate({ async: false });
      this.results = die.terms[0].results;
      if (this.data.useWildDie) {
        this.results = this.results.concat(die.terms[2].results);
      }
      this._total = this.calculateTotal(die._total);
      this.modifyResults();
      this._formula = data.formula;
      this._evaluated = true;
      this._dice = die.terms;
      if (this.data.useWildDie) {
        this._dice[0].options.colorset = "SR6_light";
      }
    } else  if (data.buttonType == 1) {
      noOfDice = Math.floor(noOfDice / 4);
      formula = this.createFormula(noOfDice, -1, false);
      die = new Roll(formula).evaluate({ async: false });
      this.results = die.terms[0].results;
      this.results.forEach(result => {
        result.result = 6;
        result.success = true;
        result.classes = "die die_" + result.result;
      });
      this._total = noOfDice;
      this._formula = game.i18n.localize("shadowrun6.roll.hits_bought");
      this._evaluated = true;
      this._dice = die.terms;
    }
	this.dummy = "aus evaluate()";
	 console.log("LEAVE evaluate()");
    return this;
  }

  calculateTotal(result) {
    let total = parseInt(result);
    if (this.data.useWildDie && this.results[0].result == 1) {
      //5 zählen nicht
      total -= this.results.filter(die => die.result === 5).length;
    } else if (this.data.useWildDie && (this.results[0].result == 6 || this.results[0].result == 5)) {
      //2 zusätzliche Erfolge
      total += 2;
    }

    return total;
  }

  modifyResults() {
    let expl = false;
    let ignoreFives = false;
    if (this.data.useWildDie) {
      this.results[0].wild = true;
      ignoreFives = this.results[0].result == 1;
    }

    this.results.forEach(result => {
      result.classes = "die die_" + result.result;
      if (expl) {
        result.classes += "_exploded";
      }
      if (result.result == 5 && ignoreFives) {
        result.classes += "_ignored";
		  result.success = false;
      }
      if (result.exploded) {
        expl = true;
      } else {
        expl = false;
      }
      if (result.wild) {
        result.classes += "_wild";
      }

    });
  }

  /* -------------------------------------------- */
  /** @override */
  roll() {
    return this.evaluate();
  }

  total() {
    return this._total;
  }

  /* -------------------------------------------- */
  /** @override */
  getTooltip() {
    let parts = {};
    return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { parts, data: this.data, results: this.results, total: this._total });
  }

  /* -------------------------------------------- 
  * Hier wird die Ausgabe zusammengeschustert
  */
  async render(chatOptions = {}) {
	console.log("ENTER render");
    chatOptions = mergeObject(
      {
		  from: "render.chatOptions",
        user: game.user.id,
        flavor: this.actionText,
        template: this.constructor.CHAT_TEMPLATE,
      },
      chatOptions
    );


    let isPrivate = chatOptions.isPrivate;

    const chatData = {
		  from: "render.chatData",
      results: isPrivate ? "???" : this.results,
      formula: isPrivate ? "???" : this._formula,
      flavor: isPrivate ? null : chatOptions.flavor,
      user: chatOptions.user,
      total: isPrivate ? "?" : Math.round(this._total * 100) / 100,
      glitch: isPrivate ? false : this.isGlitch(),
      criticalGlitch: isPrivate ? false : this.isCriticalGlitch(),
      success: isPrivate ? false : this.isSuccess(),
      data: this.data,
      publicRoll: !chatOptions.isPrivate,
      tooltip: isPrivate ? "" : await this.getTooltip(),
    };

    let html = await renderTemplate(chatOptions.template, chatData);
	console.log("LEAVE render");
    return html;
  }

  /* -------------------------------------------- */
  async toMessage(chatOptions, { rollMode = null, create = true } = {}) {
	console.log("ENTER toMessage");
    const rMode = rollMode || chatOptions.rollMode || game.settings.get("core", "rollMode");

    let template = CONST.CHAT_MESSAGE_TYPES.OTHER;
    if (["gmroll", "blindroll"].includes(rMode)) {
      chatOptions.whisper = ChatMessage.getWhisperRecipients("GM");
    }
    if (rMode === "blindroll") chatOptions.blind = true;
    if (rMode === "selfroll") chatOptions.whisper = [game.user.id];

    // Prepare chat data
    chatOptions = mergeObject(
      {
		  from: "toMessage.chatOptionsMerged",
        user: game.user.id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        content: this.total,
        sound: CONFIG.sounds.dice,
        roll: this
      },
      chatOptions
    );
    chatOptions.roll = this;
    chatOptions.content = await this.render(chatOptions);
    ChatMessage.create(chatOptions);
	console.log("LEAVE toMessage");
  }

  /** @override */
	toJSON() {
		const json = super.toJSON();
		json.data = this.data;
		json.results = this.results;
		return json;
	}

  /** @override */
  static fromData(data) {
    const roll = super.fromData(data);
    roll.data = data.data;
	 roll.results = data.results;
    return roll;
  }

  /**
   * Build a formula for a Shadowrun dice roll.
   * Assumes roll will be valid (e.g. you pass a positive count).
   * @param count The number of dice to roll.
   * @param limit A limit, if any. Negative for no limit.
   * @param explode If the dice should explode on sixes.
   */
  createFormula(count, limit = -1, explode = false) {
    let formula = `${count}d6`;
    if (explode) {
      formula += 'x6';
    }
    if (limit > 0) {
      formula += `kh${limit}`;
    }

    return `${formula}cs>=5`;
  }

  /**
   * The number of hits rolled.
   */
  getHits() {
    if (!this._rolled) return NaN;
    return this.total;
  }

  /**
   * The number of glitches rolled.
   */
  getGlitches() {
    if (!this._evaluated) {
      return NaN;
    }
    return this.results.filter(die => die.result === 1).length;
  }

  /**
   * Is this roll a regular (non-critical) glitch?
   */
  isGlitch() {
    return this.getGlitches() > this.results.length / 2;
  }

  /**
   * Is this roll a critical glitch?
   */
  isCriticalGlitch() {
    return this.isGlitch() && this.getHits() === 0;
  }

  isSuccess() {
    if (this.data.threshold > 0) {
      return this._total >= this.data.threshold;
    } else {
      return this._total > 0;
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
		default:
			console.log("ToDo: Support edge action "+boostOrActionId);
		}	

		// Update content on dialog	
		$("input[name='modifier']")[0].value = data.modifier;
		$("input[name='explode' ]")[0].value = data.explode;
		$("input[name='explode' ]")[0].checked = data.explode;
		this._updateDicePool(data);
		
	}
	
	//-------------------------------------------------------------
	async _payEdge(cost, user, actor) {
		console.log("ENTER: _payEdge("+cost+","+user+","+actor+")");
		actor.data.data.edge.value -= cost;
		if (actor.data.data.edge.value<0) {
			actor.data.data.edge.value=0;
		}
		actor.update({ [`data.edge.value`]: actor.data.data.edge.value });
			
		
		let er = new Roll(cost+"dc", {}, {
			blind: true,
			flavor: "Edge"
		});
		er.evaluate({async: false});
		if (game.dice3d) {
			game.dice3d.showForRoll(er);
		}
//		let edgeChat = await er.toMessage();
//		console.log("edgeChat = ",edgeChat);
		
//		edgeChat.delete();
	}
	
	//-------------------------------------------------------------
	_getFailedIndices(results, max) {
		let indices = [];
		for (let i=0; i<results.length; i++) {
			if (results[i].count==0 && indices.length<max) {
				indices.push(i);
			}
		}
		return indices;
	}
	
	//-------------------------------------------------------------
	_getPlusOneIndex(results) {
		let indices = [];
		for (let i=0; i<results.length; i++) {
			if (results[i].count==0 && results[i].result===4) {
				return i;
			}
		}
		return -1;
	}
	
	//-------------------------------------------------------------
	async _rerollIndices(chatMsg, roll, indices, html) {
		console.log("_rerollIndices ",indices);
		
		let rollData = {};
		rollData.pool = indices.length;
		rollData.formula = rollData.pool + "d6";
		rollData.modifier= 0;
		rollData.buttonType=0;
		rollData.edge_use="reroll";
		rollData.actionText="Reroll";
		let r = new SR6Roll("", rollData);
		let diceHtml = html.find(".dice-rolls");
		try {
      	r.evaluate();
			r.toMessage(rollData);
			let newTotal = roll._total + r._total;
			roll._total = newTotal;
			
			// Change previous results
			for (var i=0; i<indices.length; i++) {
				let index = indices[i];
				roll.data.results[index] = r.results[i];
			}
			// Try to update html
			diceHtml.children().each(function(i, obj) {
				$(obj).attr("class", roll.data.results[i].classes);
			});
			html.find(".spend_edge").append('<h4 class="highlight" style="margin:0px">Rerolled</h4>');
			html.find(".resulttext").empty();
			html.find(".resulttext").append(
			game.i18n.localize('shadowrun6.roll.success')+": <b>"+newTotal+"</b> "+game.i18n.localize('shadowrun6.roll.successes'));
			
			// Update message
			roll.results = roll.data.results;
			chatMsg.update({
				 [`roll`]: roll.toJSON(),
				 ['content']: html[0].innerHTML 
			});
		} catch (err) {
      	console.error("sr6_roll error: "+err);
      	console.error("sr6_roll error: "+err.stack);
			ui.notifications.error(`Dice roll evaluation failed: ${err.message}`);
    	}
	}
	
	//-------------------------------------------------------------
	async _performPlusOne(chatMsg, roll, index, html) {
		console.log("_performPlus1 ");
		
		let newResult = roll.data.results[index].result+1;
		let newTotal = roll._total;
		
			// Change previous results
		roll.data.results[index].result = newResult;
		roll.data.results[index].classes = "die die_"+newResult;
		if ( roll.data.results[index].result>=5) {
			roll.data.results[index].success = true;
			newTotal++;
		} 

		let diceHtml = html.find(".dice-rolls");
		try {
			roll._total = newTotal;
			
			// Try to update html
			diceHtml.children().each(function(i, obj) {
				$(obj).attr("class", roll.data.results[i].classes);
			});
			html.find(".spend_edge").append('<h4 class="highlight" style="margin:0px">+1 to one die</h4>');
			html.find(".resulttext").empty();
			html.find(".resulttext").append(
			game.i18n.localize('shadowrun6.roll.success')+": <b>"+newTotal+"</b> "+game.i18n.localize('shadowrun6.roll.successes'));
			
			// Update message
			roll.results = roll.data.results;
			chatMsg.update({
				 [`roll`]: roll.toJSON(),
				 ['content']: html[0].innerHTML 
			});
		} catch (err) {
      	console.error("sr6_roll error: "+err);
      	console.error("sr6_roll error: "+err.stack);
			ui.notifications.error(`Dice roll evaluation failed: ${err.message}`);
    	}
	}
	
	//-------------------------------------------------------------
	peformPostEdgeBoost(chatMsg, html, data, btnPerform, edgeBoosts, edgeActions, event) {
		console.log("ToDo performPostEdgeBoost");
		console.log("chatMsg = ",chatMsg);
		console.log("   data = ",data);
		console.log("   html = ",html);
		console.log("results = ",chatMsg._roll.data.results);
		let results = chatMsg._roll.data.results;

		let user  = game.users.get(data.message.user);
		let actor = game.actors.get(chatMsg._roll.data.actor._id);
		let diceHtml = html.find(".message-content");

		let boostOrActionId = chatMsg.data.edgeBoost;
		if (boostOrActionId==='edge_action') {
			boostOrActionId = chatMsg.data.edgeAction;
		}
		console.log("to perform: "+boostOrActionId);
		
		// Remove "Spending Edge"
		html.find(".spend_edge").empty();
		
		
		switch (boostOrActionId) {
		case "reroll_one":
			console.debug("Reroll one die");
			chatMsg._roll._payEdge(1, user, actor);
			chatMsg._roll._rerollIndices(chatMsg, chatMsg._roll, chatMsg._roll._getFailedIndices(results,1), diceHtml);
			break;
		case "plus_1_roll":
			console.debug("+1 to single roll");
			chatMsg._roll._payEdge(2, user, actor);
			// ToDo: Find a 4 or at least a 1
			chatMsg._roll._performPlusOne(chatMsg, chatMsg._roll, chatMsg._roll._getPlusOneIndex(results), diceHtml);
			break;
		case "reroll_failed":
			console.debug("Reroll all failed");
			chatMsg._roll._payEdge(4, user, actor);
			chatMsg._roll._rerollIndices(chatMsg, chatMsg._roll, chatMsg._roll._getFailedIndices(results,Number.MAX_VALUE), diceHtml);
			break;
		default:
			console.log("ToDo: Support edge action "+boostOrActionId);
		}	


/*
		let rollData = {};
		rollData.pool = 2;
		rollData.formula = rollData.pool + "d6";
		rollData.modifier= 0;
		rollData.buttonType=0;
		rollData.edge_use=false;
		let r = new SR6Roll("", rollData);
		try {
	   	console.log("Call r.evaluate: "+r);
      	r.evaluate();
			console.log(" toMessage  data = ",data);
			console.log(" toMessage  r    = ",r);
			console.log(" Reroll = ",r.results);
			r.toMessage(rollData);
			
	    	let chatOptions = mergeObject( {
				from: "peformPostEdgeBoost.chatOptionsMerged",
				user: game.user.id,
				type: CONST.CHAT_MESSAGE_TYPES.ROLL,
				sound: CONFIG.sounds.dice,
				roll: r
      		},
				data
			);
			//chatOptions.content = r.render(chatOptions);
    		//ChatMessage.create(chatOptions);
		} catch (err) {
      	console.error("sr6_roll error: "+err);
      	console.error("sr6_roll error: "+err.stack);
			ui.notifications.error(`Dice roll evaluation failed: ${err.message}`);
    	}
		*/
	}
	
}
