import { ChatMessageData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import { ConfiguredDocumentClass } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { Data, Evaluated, MessageData, Options } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll";
import { SR6Actor } from "./ActorTypes.js";
import { MonitorType } from "./config.js";
import { ConfiguredRoll, SR6ChatMessageData, ReallyRoll, RollType, DefenseRoll } from "./dice/RollTypes.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";

/**
 * 
 */
export default class SR6Roll extends Roll<ConfiguredRoll> {
	
	finished   : SR6ChatMessageData;
	configured : ConfiguredRoll ;

    static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
    static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

    //_total: number;
    results: DiceTerm.Result[];

	constructor(formula: string, data: ConfiguredRoll, options?: SR6Roll['options']) {
		super(formula, data, options);
		this.configured = data;
      console.log("In SR6Roll<init>1(" + formula + " , ", data);
      console.log("In SR6Roll<init>2(", options);
   }

    evaluate(options?: InexactPartial<Options & { async: false }>): Evaluated<this>;
    evaluate(options: InexactPartial<Options> & { async: true }): Promise<Evaluated<this>>;
    evaluate(options?: InexactPartial<Options>): Evaluated<this> | Promise<Evaluated<this>> {
		console.log("ENTER evaluate()");
		console.log("   this: " , this);
		// IMPORTANT: Before merging arrays, have them calculated
		super.evaluate(  { async:false });
		try {
			//console.log("BEFORE _total  : " , this._total);
			//console.log("BEFORE total   : " , this.total);
			//console.log("BEFORE dice    : " , this.dice);
			this.modifyResults();
			if (this.data.useWildDie) {
				
				let merged : Die = new Die( );
				merged.faces = 6;
				merged.isIntermediate = false;
				merged.number = this.dice[0].number + this.dice[1].number;
				merged.results = this.dice[1].results.concat(this.dice[0].results);
				(merged as any)._evaluated = true;
				this.terms = [merged];
//				console.log(" result3 ",merged);
				this.results = merged.results;
				this.finished.pool = merged.number;
			} else {
				this.results = this.dice[0].results;
				this.finished.pool = this.dice[0].number;
			}
				
/*			console.log("AFTER  _dice   : " , this._dice);
			console.log("AFTER  dice    : " , this.dice);
			console.log("AFTER  _total  : " + this._total);
			console.log("AFTER  total   : " + this.total);
			console.log("AFTER  _results: " + this.results);
			console.log("   this: " , this);
*/		
            this._evaluated = true;
				this._formula = (this.data as ConfiguredRoll).pool + "d6";
				
//				console.log("before leaving evalulate(): finished=",this.finished)
            return (this as Evaluated<this>);
        } finally {
            console.log("LEAVE evaluate()");
        }
    }

	/**********************************************
	 */
   private  calculateTotal():number {
 		console.log("-----calculateTotal");
     let total:number = 0;
		this.dice.forEach(term => {
	    	term.results.forEach(die =>  total+= die.count!);
		});
		this._total;
      return total;
    }

	/**********************************************
	 * @override
	 */
	_evaluateTotal() : number {
		console.log("-----evaluateTotal");
		super._evaluateTotal();
      let total:number = 0;
		this.dice.forEach(term => {
    		let addedByExplosion = false;
	    	term.results.forEach(die =>  total+= die.count!);
		});
		
		
		console.log("_evaluateTotal: create SR6ChatMessageData",this)
		this.finished = new SR6ChatMessageData(this.configured);
		this.finished.glitch = this.isGlitch();
		this.finished.criticalglitch = this.isCriticalGlitch();
		this.finished.success = this.isSuccess();
		this.finished.threshold = this.configured.threshold;
		
		// ToDO: Detect real monitor
		this.finished.monitor = MonitorType.PHYSICAL;
		
		if (this.configured.rollType==RollType.Defense) {
			console.log("_evaluateTotal: calculate remaining damage");
			this.finished.damage = (this.configured as unknown as DefenseRoll).damage + ( this.configured.threshold - total);
			console.log("_evaluateTotal: remaining damage = "+this.finished.damage);
		}
		
		console.log("_evaluateTotal: return ",this.finished)
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
		if (this.dice.length==1) {
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

	/*****************************
	 * @override
	 */
	modifyResults():void {
		this._assignBaseCSS();
		let ignoreFives = this._markWildDie();
	
		this.dice.forEach(term => {
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
		console.log("createFormula-------------------------------");
		if (!count) {
			throw new Error("createFormula: Number of dice not set"); 
		}
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
    if (!this._total) return NaN;
    return this.total;
  }

  /**
   * The number of glitches rolled.
   */
  getGlitches() {
    if (!this._evaluated || !this.results) {
      return NaN;
    }
    return this.results.filter(die => die.result === 1).length;
  }

  /**
   * Is this roll a regular (non-critical) glitch?
   */
  isGlitch() {
    if (!this._evaluated || !this.results) {
      return false;
    }
    return this.getGlitches() > this.results.length / 2;
  }

  /**
   * Is this roll a critical glitch?
   */
  isCriticalGlitch() {
    return this.isGlitch() && this.getHits() === 0;
  }

	isSuccess() {
		console.log("SR6Roll.isSuccess for ",this)
    if (this.finished.threshold! > 0) {
      return this._total! >= this.finished.threshold!;
    } else {
      return this._total! > 0;
    }
  }

    /**
     * Represent the data of the Roll as an object suitable for JSON serialization.
     * @returns Structured data which can be serialized into JSON
	  * @override
     */
	toJSON() {
		//console.log("toJSON ",this);
		const json = super.toJSON();
		//console.log("toJSON: json=",json);
		(json as any).data = this.data;
		(json as any).configured = this.configured;
		(json as any).finished = this.finished;
		(json as any).results = this.results;
		return json;
	}

    /**
     * Recreate a Roll instance using a provided data object
     * @param data - Unpacked data representing the Roll
     * @returns A reconstructed Roll instance
	  * @override
     */
   static fromData<T extends Roll>(this: ConstructorOf<T>, data: Data): T {
		const roll : Roll = super.fromData(data);
		//console.log("fromData ",roll);
    	(roll as any).configured = (data as any).configured;
    	(roll as any).finished = (data as any).finished;
    	(roll as any).results = (data as any).results;
		console.log("fromData returning ",roll);
    	return roll as T;
	}

  /*****************************************
   * @override 
	****************************************/
  	getTooltip(): Promise<string> {
 		//console.log("getTooltip = ",this);
  		let parts = {};

    	return renderTemplate(SR6Roll.TOOLTIP_TEMPLATE, { parts,  finished: this.finished, data: this.data, results: this.results, total: this._total });
	}

	/*****************************************
	 * Render to Chat message
	 * @returns HTML
	 ******************************************/
	async render(options?: { flavor?: string | undefined; template?: string | undefined; isPrivate?: boolean | undefined; } | undefined) : Promise<string> {
		console.log("ENTER render");
		console.log("options = ",options);
		console.log("finished = ",this.finished);
		console.log("configured = ",this.configured);
		console.log("data = ",this.data);
		try {
			
    		if ( !this._evaluated ) await this.evaluate({async: true});
			let isPrivate = options!.isPrivate;
			//this.finished = new SR6ChatMessageData(this.configured);
			if (this.configured) {
				this.finished.actionText = isPrivate ? "" : this.configured.actionText;
				if (this.finished.rollType==RollType.Soak) {
					this.finished.damage = this.finished.threshold! - this._total!;
				/*
					if (this.finished.speaker.token) {
						console.log("####Apply "+this.finished.damage+" to token "+this.finished.speaker.alias);
						let scene  = (game as Game).scenes!.get(this.finished.speaker.scene!);
						console.log("Found scene ",scene);			
					}
					if (this.finished.speaker) {
						let actor : Shadowrun6Actor = ( (game as Game).actors!.get(this.finished.speaker.actor!) as Shadowrun6Actor);
						console.log("Found actor ",actor);
						if (!this.finished.damageAfterSoakAlreadyApplied) {
							console.log("####Apply "+this.finished.damage+" "+this.finished.monitor+" to actor "+this.finished.speaker.alias);
							if (this.finished.damage>0) {
								actor.applyDamage( this.finished.monitor, this.finished.damage);
							}
							this.finished.damageAfterSoakAlreadyApplied = true;
						}
					}
				*/
				}
			}
			//finished.user    = (game as Game).user!.id,
			this.finished.success = this.isSuccess();
			this.finished.glitch  = this.isGlitch();
			this.finished.criticalglitch = this.isCriticalGlitch();
			this.finished.total   = this._total!;
			this.finished.configured = this.configured;
			this.finished.results = isPrivate ? "???" : this.results,
			this.finished.formula = isPrivate ? "???" : this._formula,
			this.finished.publicRoll = !isPrivate;
			this.finished.tooltip = isPrivate ? "" : await this.getTooltip();
			this.finished.publicRoll = ! options!.isPrivate;
			

			

			return renderTemplate(SR6Roll.CHAT_TEMPLATE, this.finished);
		} finally {
			console.log("LEAVE render");
		}
  }

}

export class SR6RollChatMessage extends ChatMessage {
	
	hello : number;
	total : 3;
	dice : 2;

    constructor(
      data?: ConstructorParameters<ConstructorOf<foundry.documents.BaseChatMessage>>[0],
      context?: ConstructorParameters<ConstructorOf<foundry.documents.BaseChatMessage>>[1]
    ) {
        super(data, context);
         console.log("In SR6RollChatMessage<init>(" + data + " , ", context);
    }
}
