import { Evaluated, Options } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll";
import { ConfiguredRoll, ReallyRoll } from "./dice/RollTypes.js";

/**
 * 
 */
export default class SR6Roll extends Roll<ConfiguredRoll> {

    //	static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
    //	static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

    _total: number;
    results: DiceTerm.Result[];

    constructor(formula: string, data?: ConfiguredRoll, options?: SR6Roll['options']) {
        super(formula, data, options);
        let data2: ConfiguredRoll = this.data;
        this._total = 5;
        console.log("In SR6Roll<init>(" + formula + " , ", data);
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
    evaluate(options?: InexactPartial<Options & { async: false }>): Evaluated<this>;
    evaluate(options: InexactPartial<Options> & { async: true }): Promise<Evaluated<this>>;
    evaluate(options?: InexactPartial<Options>): Evaluated<this> | Promise<Evaluated<this>> {
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

                this.results = (die.terms[0] as any).results;
                if (this.data.useWildDie) {
                    this.results = this.results.concat((die.terms[2] as any).results);
                }
                this._total = this.calculateTotal(die.total);
                // this.modifyResults();
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

/*               this.results = die.terms[0].results;
                this.results.forEach(result => {
                    result.result = 6;
                    result.success = true;
                    result.classes = "die die_" + result.result;
                });
                this._total = noOfDice;
                this._formula = game.i18n.localize("shadowrun6.roll.hits_bought");
                this._evaluated = true;
                this._dice = die.terms;
*/            } else {
                console.log("How did I get here?");
            }

            console.log("total = " + this._total);
            this._evaluated = true;
            return (this as Evaluated<this>);
        } finally {
            console.log("LEAVE evaluate()");
        }
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
