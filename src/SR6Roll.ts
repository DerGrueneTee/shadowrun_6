import { ChatMessageData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import { Data, Evaluated, MessageData, Options } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll";
import { ConfiguredDocumentClass } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { ConfiguredRoll, FinishedRoll, ReallyRoll } from "./dice/RollTypes.js";

/**
 * 
 */
export default class SR6Roll extends Roll<ConfiguredRoll> {
	
	finished   : FinishedRoll;
	configured : ConfiguredRoll ;

    static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
    //static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

    //_total: number;
    results: DiceTerm.Result[];

	constructor(formula: string, data: ConfiguredRoll, options?: SR6Roll['options']) {
		super(formula, data, options);
		this.configured = data;
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
			//console.log("BEFORE _total  : " , this._total);
			//console.log("BEFORE total   : " , this.total);
			//console.log("BEFORE dice    : " , this.dice);
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
				this.results = merged.results;
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
				
				let foo:any = {
					test :  "aus_evaluate",
					bla  :  "fasel"
				};
				(this as any).data =  foo;
            return (this as Evaluated<this>);
        } finally {
            console.log("LEAVE evaluate()");
        }
    }

   private  calculateTotal():number {
 		console.log("-----calculateTotal");
     let total:number = 0;
		this.dice.forEach(term => {
	    	term.results.forEach(die =>  total+= die.count!);
		});
		this._total;
      return total;
    }

	/**
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
		
		/*
		this.finished = new FinishedRoll();
		this.finished.glitch = this.isGlitch();
		this.finished.criticalglitch = this.isCriticalGlitch();
		this.finished.success = this.isSuccess();
		*/
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
		console.log("getGlitches ", this);
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
    if (this.data.threshold > 0) {
      return this._total! >= this.data.threshold;
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
		const json = super.toJSON();
		(json as any).configured = this.configured;
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
		console.log("fromData ",roll);
    	(roll as any).configured = (data as any).configured;
    	(roll as any).results = (data as any).results;
    	return roll as T;
	}

	/*****************************************
	 * Render to Chat message
	 * @returns HTML
	 ******************************************/
	async render(chatOptions = { flavor:"kein_geschmack"}) : Promise<string> {
		console.log("ENTER render");
		console.log("data = ",this);
		try {
    		if ( !this._evaluated ) await this.evaluate({async: true});
			let isPrivate = false;
/*			chatOptions = mergeObject({
		  		from: "render.chatOptions",
        		user: (game as Game).user!.id,
        		flavor: this.configured.actionText,
        		template: SR6Roll.CHAT_TEMPLATE,
      		}, chatOptions
    		);
*/
			let chatData = new FinishedRoll();
			chatData.actionText = isPrivate ? "" : this.configured.actionText;
			//chatData.user    = (game as Game).user!.id,
			chatData.success = this.isSuccess();
			chatData.glitch  = this.isGlitch();
			chatData.criticalglitch = this.isCriticalGlitch();
			chatData.total   = this._total!;
			chatData.configured = this.configured;
			chatData.results = isPrivate ? "???" : this.results,
			chatData.formula = isPrivate ? "???" : this._formula,
			chatData.publicRoll = !isPrivate;
			chatData.tooltip = isPrivate ? "" : await this.getTooltip();

			return renderTemplate(SR6Roll.CHAT_TEMPLATE, chatData);
		} finally {
			console.log("LEAVE render");
		}
  }

/*
		toMessadge(messageData={}, { create=true}={}) : Promise<InstanceType<ConfiguredDocumentClass<typeof ChatMessage>> | undefined> | MessageData<any> {
   	console.log("ENTER toMessage");
		try {
        console.log("messageData ", messageData);
		let chatOptions : FinishedRoll = (this as unknown as FinishedRoll);

         // Prepare chat data
        let chatOptions2:any = mergeObject({
            from: "toMessage.chatOptionsMerged",
            //user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            content: "Hier stand this.total",
            sound: CONFIG.sounds.dice,
            _roll: this,
				finished : chatOptions
        }, chatOptions);
		//return super.toMessage(chatOptions2);
        let xsg : Promise<InstanceType<ConfiguredDocumentClass<typeof ChatMessage>> | undefined> = ChatMessage.create(chatOptions2);

        console.log("called create" , xsg);	
		let msg : SR6RollChatMessage = new SR6RollChatMessage(chatOptions2, this);        
		return msg;

		} finally {
			console.log("LEAVE toMessage");
		}	
}
*/

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
