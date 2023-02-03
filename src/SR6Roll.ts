import { ChatMessageData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import { ConfiguredDocumentClass } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { Data, Evaluated, MessageData, Options } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll";
import { SR6Actor } from "./ActorTypes.js";
import { MonitorType } from "./config.js";
import { ConfiguredRoll, SR6ChatMessageData, ReallyRoll, RollType, DefenseRoll, PreparedRoll } from "./dice/RollTypes.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";

/**
 *
 */
export default class SR6Roll extends Roll<ConfiguredRoll> {
	finished: SR6ChatMessageData;
	prepared: PreparedRoll;
	configured: ConfiguredRoll;

	static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
	static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

	//_total: number;
	results: DiceTerm.Result[];

	constructor(formula: string, data: ConfiguredRoll, options?: SR6Roll["options"]) {
		super(formula, data, options);
		this.configured = data;
		// If entered from the combat tracker, the roll type is empty but the
		// formula gives hints what is rolled
		if (formula.indexOf("@initiative") > -1) {
			this.configured.rollType = RollType.Initiative;
		}
		console.log("In SR6Roll<init>1(" + formula + " , ", data);
		//console.log("In SR6Roll<init>2(", options);
	}

	evaluate(options?: InexactPartial<Options & { async: false }>): Evaluated<this>;
	evaluate(options: InexactPartial<Options> & { async: true }): Promise<Evaluated<this>>;
	evaluate(options?: InexactPartial<Options>): Evaluated<this> | Promise<Evaluated<this>> {
		console.log("ENTER evaluate()");
		console.log("   this: ", this);
		console.log("   formula: ", this._formula);

		if (this.configured.buttonType === ReallyRoll.AUTOHITS) {
			// Hits have been bought
			console.log("BOUGHT HITS for pool", this.configured.pool);
			let noOfDice: number = Math.floor(this.configured.pool / 4);
			let formula = this.createFormula(noOfDice, -1, false);
			let die: Evaluated<Roll> = new Roll(formula).evaluate({ async: false });
			this.results = (die.terms[0] as any).results;
			this.results.forEach((result) => {
				result.result = 6;
				result.success = true;
				result.count = 1;
				(result as any).classes = "die die_" + result.result;
			});
			this._total = noOfDice;
			this._formula = (game as any).i18n.localize("shadowrun6.roll.hits_bought");
			this._evaluated = true;
			this.terms = die.terms;
		} else if (this.configured.buttonType === ReallyRoll.ROLL) {
			let die: Evaluated<Roll> = new Roll(this._formula).evaluate({ async: false });
			console.log("Nested roll has a total of " + die.total, die);
			this.results = (die.terms[0] as any).results;
			this._total = die._total;
			this.terms = die.terms;

			// In case of a wild die, color the wild die
			// and merge results
			if (this.data.useWildDie) {
				(this.dice[1].options as any).colorset = "SR6_light";
				this.results = this.results.concat((die.terms[2] as any).results);
			} else {
				this.results = (die.terms[0] as any).results;
			}
		} else {
			console.log("Unmodified roll " + this._formula);
			let die: Evaluated<Roll> = new Roll(this._formula).evaluate({ async: false });
			this.results = (die.terms[0] as any).results;
			this._total = die._total;
			this.terms = die.terms;
		}
		this._evaluated = true;

		try {
			// Mark wild dice and assign count values to single die
			this.modifyResults();

			if (this.configured.rollType && this.configured.rollType != RollType.Initiative) {
				this._total = this.calculateTotal();
				this._evaluated = true;
				this._formula = (this.data as ConfiguredRoll).pool + "d6";
			} else {
				this._formula = this.formula;
			}

			this._prepareChatMessage();
			return this as Evaluated<this>;
		} finally {
			console.log("LEAVE evaluate()");
		}
	}

	/**********************************************
	 */
	private calculateTotal(): number {
		console.log("LEAVE calculateTotal", this);
		let total: number = 0;
		this.dice.forEach((term) => {
			term.results.forEach((die) => (total += die.count!));
		});
		return total;
	}

	//**********************************************
	oldEvaluateTotal(): number {
		console.log("-----evaluateTotal");

		let normalTotal: number = super._evaluateTotal();
		let total: number = 0;
		this.dice.forEach((term) => {
			let addedByExplosion = false;
			console.log("-----evaluateTotal : ", term.results);
			term.results.forEach((die) => (total += die.count!));
		});
		console.log("-----evaluateTotal.2:", total, " -", normalTotal);

		console.log("_evaluateTotal: create SR6ChatMessageData", this);
		this.finished = new SR6ChatMessageData(this.configured);
		this.finished.glitch = this.isGlitch();
		this.finished.criticalglitch = this.isCriticalGlitch();
		this.finished.success = this.isSuccess();
		this.finished.threshold = this.configured.threshold;
		//this.finished.rollMode = this.configured.rollMode;
		if (this.configured.rollType === RollType.Initiative) {
			this.finished.threshold = 0;
			this.finished.success = true;
			this.finished.formula = this._formula;
			this.finished.total = total;
			this._total = total;
		}

		// ToDO: Detect real monitor
		this.finished.monitor = MonitorType.PHYSICAL;

		if (this.configured.rollType == RollType.Defense) {
			console.log("_evaluateTotal: calculate remaining damage");
			this.finished.damage = (this.configured as unknown as DefenseRoll).damage + (this.configured.threshold - total);
			console.log("_evaluateTotal: remaining damage = " + this.finished.damage);
		}

		console.log("_evaluateTotal: return ", this.finished);
		return total;
	}

	//**********************************************
	_prepareChatMessage(): void {
		console.log("_prepareChatMessage: create SR6ChatMessageData", this);
		this.finished = new SR6ChatMessageData(this.configured);
		this.finished.glitch = this.isGlitch();
		this.finished.criticalglitch = this.isCriticalGlitch();
		this.finished.success = this.isSuccess();
		this.finished.threshold = this.configured.threshold;
		this.finished.total = this.total!;
		//this.finished.rollMode = this.configured.rollMode;
		if (this.configured.rollType === RollType.Initiative) {
			this.finished.threshold = 0;
			this.finished.success = true;
			this.finished.formula = this._formula;
			this.finished.total = this.total!;
		}

		// ToDO: Detect real monitor
		this.finished.monitor = MonitorType.PHYSICAL;

		if (this.configured.rollType == RollType.Defense) {
			console.log("_evaluateTotal: calculate remaining damage");
			this.finished.damage = (this.configured as unknown as DefenseRoll).damage + (this.configured.threshold - this.total!);
			console.log("_evaluateTotal: remaining damage = " + this.finished.damage);
		}
	}

	/**
	 * Assign base css classes
	 */
	_assignBaseCSS(): void {
		this.dice.forEach((term) => {
			term.results.forEach((die) => {
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
	_markWildDie(): boolean {
		let ignoreFives = false;
		if (this.dice.length == 1) {
			console.log("Not a wild die roll");
			return ignoreFives;
		}

		console.log("markWildDie: ", this.dice[1]);
		if (this.dice[1]) {
			let lastExploded: boolean | undefined = false;
			this.dice[1].results.forEach((die) => {
				if (!lastExploded) {
					(die as any).classes += "_wild";
					(die as any).wild = true;
					// A 5 or 6 counts as 3 hits
					if (die.success) {
						die.count = 3;
					} else if (die.result === 1) {
						ignoreFives = true;
					}
				}
				lastExploded = die.exploded;
				console.debug("Die " + die.result + " = " + ignoreFives);
			});
		} else {
			console.error("Wild die check not working in V10");
		}

		return ignoreFives;
	}

	/*****************************
	 * @override
	 */
	modifyResults(): void {
		this._assignBaseCSS();
		let ignoreFives = this._markWildDie();

		this.dice.forEach((term) => {
			let addedByExplosion = false;
			term.results.forEach((result) => {
				if (addedByExplosion) {
					if ((result as any).classes.includes("_wild")) {
						(result as any).classes = (result as any).classes.substring(0, (result as any).classes.length - 5);
					}
					if (!(result as any).classes.includes("_exploded")) {
						(result as any).classes += "_exploded";
					}
				}
				if (result.result == 5 && ignoreFives && ((result as any).classes as string).indexOf("_ignored") < 0) {
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
			formula += "x6";
		}
		if (limit > 0) {
			formula += `kh${limit}`;
		}

		return `${formula}cs>=5`;
	}

	/**
	 * The number of glitches rolled.
	 */
	getGlitches() {
		if (!this._evaluated || !this.results) {
			return NaN;
		}
		return this.results.filter((die) => die.result === 1).length;
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
		return this.isGlitch() && this._total === 0;
	}

	isSuccess() {
		console.log("SR6Roll.isSuccess for ", this);
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
		console.log("toJSON ", this);
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
		const roll: Roll = super.fromData(data);
		//console.log("fromData ",roll);
		(roll as any).configured = (data as any).configured;
		(roll as any).finished = (data as any).finished;
		(roll as any).results = (data as any).results;
		//console.log("fromData returning ",roll);
		return roll as T;
	}

	/*****************************************
	 * @override
	 ****************************************/
	getTooltip(): Promise<string> {
		//console.log("getTooltip = ",this);
		let parts = {};

		return renderTemplate(SR6Roll.TOOLTIP_TEMPLATE, { parts, finished: this.finished, data: this.data, results: this.results, total: this._total });
	}

	/*****************************************
	 * Render to Chat message
	 * @returns HTML
	 ******************************************/
	async render(
		options?: { flavor?: string | undefined; template?: string | undefined; isPrivate?: boolean | undefined } | undefined
	): Promise<string> {
/*		console.log("ENTER render");
		console.log("options = ", options);
		console.log("this = ", this);
		console.log("this.data = ", this.data);
		console.log("this.finished = ", this.finished);
*/		try {
			if (!this._evaluated) await this.evaluate({ async: true });
			let isPrivate = options ? options!.isPrivate : false;
			if (!this.finished) {
				console.log("#####this.finished not set#############");
				this.finished = new SR6ChatMessageData(this.configured);
			}
			//this.finished = new SR6ChatMessageData(this.configured);
			if (this.configured) {
				this.finished.actionText = isPrivate ? "" : this.configured.actionText;
				if (this.finished.rollType == RollType.Soak) {
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
			this.finished.glitch = this.isGlitch();
			this.finished.criticalglitch = this.isCriticalGlitch();
			this.finished.total = this._total!;
			this.finished.configured = this.configured;
			(this.finished.results = isPrivate ? "???" : this.results),
				(this.finished.formula = isPrivate ? "???" : this._formula),
				(this.finished.publicRoll = !isPrivate);
			this.finished.tooltip = isPrivate ? "" : await this.getTooltip();
			this.finished.publicRoll = !isPrivate;

			return renderTemplate(SR6Roll.CHAT_TEMPLATE, this.finished);
		} finally {
			console.log("LEAVE render");
		}
	}
}

export class SR6RollChatMessage extends ChatMessage {
	hello: number;
	total: 3;
	dice: 2;

	constructor(
		data?: ConstructorParameters<ConstructorOf<foundry.documents.BaseChatMessage>>[0],
		context?: ConstructorParameters<ConstructorOf<foundry.documents.BaseChatMessage>>[1]
	) {
		super(data, context);
		//console.log("In SR6RollChatMessage<init>(", data, " , context,", context);
		let prepared: PreparedRoll = data as PreparedRoll;
	}

	getHTML(): Promise<JQuery> {
		//console.log("In SR6RollChatMessage.getHTML()", this);
		return super.getHTML();
	}
}
