import { ConfiguredRoll } from "./dice/RollTypes";

/**
 * 
 */
export default class SR6Roll extends Roll<ConfiguredRoll> {

//	static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
//	static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

	constructor(formula: string, data?:ConfiguredRoll, options?: Roll['options']) {
		super(formula, data, options);
		this._total = 5;
		console.log("In SR6Roll<init>("+formula+" , ",data);		
	}

  calculateTotal(result) {
		console.log("calculateTotal(",result);		
    let total = parseInt(result);
		/*
    if (this.data.useWildDie && this.results[0].result == 1) {
      //5 zählen nicht
      total -= this.results.filter(die => die.result === 5).length;
    } else if (this.data.useWildDie && (this.results[0].result == 6 || this.results[0].result == 5)) {
      //2 zusätzliche Erfolge
      total += 2;
    }
	*/
    return total;
  }

  /*--------------------------------------------*/
  get total() : number|undefined {
    return this._total;
  }

}