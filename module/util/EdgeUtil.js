export default class EdgeUtil {
	
	//-------------------------------------------------------------
	_updateEdgeBoosts(elem, available, when = "POST") {
		let newEdgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when==when && boost.cost<=available);

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
static onEdgeBoostActionChange(event, when="Post", chatMsg, html, data) {
		console.log("_onEdgeBoostActionChange");
		if (event.currentTarget.name === "edgeBoost") {
			const boostsSelect = event.currentTarget;
			let boostId = boostsSelect.children[boostsSelect.selectedIndex].dataset.itemBoostid;
			console.log(" boostId = "+boostId);
			chatMsg.data.edgeBoost = boostId;
		} else if (event.currentTarget.name === "edgeAction") {
			const actionSelect = event.currentTarget;
			let actionId = actionSelect.children[actionSelect.selectedIndex].dataset.itemActionid;
			console.log(" actionId = "+actionId);
			chatMsg.data.edgeAction = actionId;
			data.edge_use = game.i18n.localize("shadowrun6.edge_action."+actionId)
		}

		// Ignore this, if there is no actor
		if (!data.actor) {
			console.log("Ignore because no actor");
			return;
		}
		if (!event || !event.currentTarget) {
			console.log("Ignore because no current target");
			return;
		}
		
		console.log(" target is "+event.currentTarget.name);
		if (event.currentTarget.name === "edgeBoost") {
			const boostsSelect = event.currentTarget;
			let boostId = boostsSelect.children[boostsSelect.selectedIndex].dataset.itemBoostid;
			console.log(" boostId = "+boostId);
			data.edgeBoost = boostId;
		   if (boostId==="edge_action") {
				this._updateEdgeActions(this._element[0].getElementsByClassName("edgeActions")[0] , this.data.edge);
			} else {
				this._updateEdgeActions(this._element[0].getElementsByClassName("edgeActions")[0] , 0);
			}
			if (boostId!="none") {
				tdata.edge_use = game.i18n.localize("shadowrun6.edge_boost."+boostId)
			} else {
				data.edge_use="";
			}
			this._performEdgeBoostOrAction(data, boostId);
		} else if (event.currentTarget.name === "edgeAction") {
			const actionSelect = event.currentTarget;
			let actionId = actionSelect.children[actionSelect.selectedIndex].dataset.itemActionid;
			console.log(" actionId = "+actionId);
			data.edgeAction = actionId;
			data.edge_use = game.i18n.localize("shadowrun6.edge_action."+actionId)
			this._performEdgeBoostOrAction(data, actionId);
		}
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
}
