import { Evaluated, Options } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll";
import { ConfiguredRoll, ReallyRoll } from "./dice/RollTypes.js";

/**
 * 
 */
export default class SR6Roll extends Roll<ConfiguredRoll> {

    //static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
    //static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

    //_total: number;
    results: DiceTerm.Result[];

    constructor(formula: string, data?: ConfiguredRoll, options?: SR6Roll['options']) {
        super(formula, data, options);
        let data2: ConfiguredRoll = this.data;
         console.log("In SR6Roll<init>(" + formula + " , ", data);
    }

    evaluate(options?: InexactPartial<Options & { async: false }>): Evaluated<this>;
    evaluate(options: InexactPartial<Options> & { async: true }): Promise<Evaluated<this>>;
    evaluate(options?: InexactPartial<Options>): Evaluated<this> | Promise<Evaluated<this>> {
		console.log("ENTER evaluate()");
		console.log("   this: " , this);
		// IMPORTANT: Before merging arrays, have them calculated
		super.evaluate(  { async:false });
		try {
			console.log("BEFORE _total  : " , this._total);
			console.log("BEFORE total   : " , this.total);
			console.log("BEFORE dice    : " , this.dice);
			this.modifyResults();
			if (this.data.useWildDie) {
				
				let merged : Die = new Die( );
				merged.faces = 6;
				merged.isIntermediate = false;
				merged.number = this.dice[0].number + this.dice[1].number;
				merged.results = this.dice[0].results.concat(this.dice[1].results);
				(merged as any)._evaluated = true;
				this.terms = [merged];
				console.log(" result3 ",merged);
			}
				
			console.log("AFTER  _dice   : " , this._dice);
			console.log("AFTER  dice    : " , this.dice);
			console.log("AFTER  _total  : " + this._total);
			console.log("AFTER  total   : " + this.total);
			console.log("AFTER  _results: " + this.results);
			console.log("   this: " , this);
		
            this._evaluated = true;
            return (this as Evaluated<this>);
        } finally {
            console.log("LEAVE evaluate()");
        }
    }

    /**
     * Execute the Roll, replacing dice and evaluating the total result
     * @param options - Options which inform how the Roll is evaluated
     *                  (default: `{}`)
     * @returns The evaluated Roll instance
     *
     * @example
     * ```typescript
     * let r = new Roll("2d6 + 5 + 1d4");
     * r.evaluate();
     * console.log(r.result); // 5 + 4 + 2
     * console.log(r.total);  // 11
     * ```
     */
    evagluate(options?: InexactPartial<Options & { async: false }>): Evaluated<this>;
    evagluate(options: InexactPartial<Options> & { async: true }): Promise<Evaluated<this>>;
    evagluate(options?: InexactPartial<Options>): Evaluated<this> | Promise<Evaluated<this>> {
        console.log("ENTER evaluate()");
        try {
            console.log("data = ", this.data);
            let data: ConfiguredRoll = this.data;
            let noOfDice: number = data.pool;
            let die: Roll;
            if (data.modifier)
                noOfDice += data.modifier;

            if (noOfDice < 0) {
                noOfDice = 0;
            }
            this._formula = noOfDice + "d6";
            let formula = "";
            console.log("noOfDice = ", noOfDice);
            console.log("ButtonType = ", data.buttonType);
            if (data.buttonType == ReallyRoll.ROLL) {
                if (this.data.useWildDie) {
                    formula = this.createFormula(1, -1, data.explode);
                    if (noOfDice - 1 > 0) {
                        formula += "+" + this.createFormula(noOfDice - 1, -1, data.explode);
                    }
                } else {
                    formula = this.createFormula(noOfDice, -1, data.explode);
                }
                console.log("formula = ", formula);
                die = new Roll(formula).evaluate({ async: false });
                console.log("die = ", die);
              console.log("die2 = ", die.terms[0]);

                this.results = (die.terms[0] as any).results;
                if (this.data.useWildDie) {
                    this.results = this.results.concat((die.terms[2] as any).results);
                }
                this._total = this.calculateTotal(die.total);
               console.log("Before modifyResults: ", this.results);
                this.modifyResults();
                this._evaluated = true;
                this.terms = die.terms;

                // this._dice = die.terms;
                if (this.data.useWildDie) {
                    (this._dice[0].options as any).colorset = "SR6_light";
                }

            } else if (data.buttonType == ReallyRoll.AUTOHITS) {
                noOfDice = Math.floor(noOfDice / 4);
                formula = this.createFormula(noOfDice, -1, false);
                die = new Roll(formula).evaluate({ async: false });
                console.log("die = ", die);
               console.log("die2 = ", die.terms[0]);

              // this.results = die.terms[0].results;
                this.results.forEach(result => {
                    result.result = 6;
                    result.success = true;
                    //result.classes = "die die_" + result.result;
                });
                this._total = noOfDice;
                this._formula = (game as Game).i18n.localize("shadowrun6.roll.hits_bought");
                // this._dice = die.terms;
            } else {
                console.log("How did I get here?");
            }

            console.log("total = " + this._total);
            this._evaluated = true;
            return (this as Evaluated<this>);
        } finally {
            console.log("LEAVE evaluate()");
        }
    }

    calculateTotal(result):number {
 		console.log("-----calculateTotal");
     let total:number = 0;
		this.dice.forEach(term => {
    		let addedByExplosion = false;
	    	term.results.forEach(die =>  total+= die.count!);
		});
		this._total;
      return total;
    }

	_evaluateTotal() : number {
		console.log("-----evaluateTotal");
		super._evaluateTotal();
      let total:number = 0;
		this.dice.forEach(term => {
    		let addedByExplosion = false;
	    	term.results.forEach(die =>  total+= die.count!);
		});
      return total;
	}

	/**
	 * Assign base css classes
	 */
	_assignBaseCSS() : void {
		this.dice.forEach(term => {
			term.results.forEach(die => {
				(die as any).classes = "die die_" + die.result;
			});
		});
	}

	/************************
	 * If there are wild die, assign them the
	 * appropriate CSS class and increase the
    * value of the count
	 * @returns TRUE, when 5s shall be ignored
	 ************************/
	_markWildDie() : boolean {
		let ignoreFives = false;
		if (this._dice.length==1) {
			console.log("Not a wild die roll");
			return ignoreFives;
		}

		this.dice[1].results.forEach( die => {
			(die as any).classes += "_wild";
			(die as any).wild    = true;
			// A 5 or 6 counts as 3 hits
			if (die.success) {
				die.count = 3;
			} else if (die.result === 1) {
				ignoreFives = true;
			}
			console.log("Die "+die.result+" = "+ignoreFives);
		});
		
		return ignoreFives;
	}

	modifyResults():void {
		this._assignBaseCSS();
		let ignoreFives = this._markWildDie();
		console.log("IgnoreFives = "+ignoreFives);
	
		this.dice.forEach(term => {
			console.log("Modify ",term);
    		let addedByExplosion = false;
	    	term.results.forEach(result => {
     			if (addedByExplosion) {
        			(result as any).classes += "_exploded";
      		}
      		if (result.result == 5 && ignoreFives) {
        			(result as any).classes += "_ignored";
		  			result.success = false;
					result.count = 0;
      		}
      		if (result.exploded) {
        			addedByExplosion = true;
      		} else {
        			addedByExplosion = false;
      		}
    		});
		});
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
}
