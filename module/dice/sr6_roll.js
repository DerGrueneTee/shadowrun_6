
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
    let data = this.data;
    let noOfDice = data.value;
    let die;
    if (data.modifier > 0) {
      noOfDice += data.modifier;
    }
    let formula = "";
    if (data.type == 0) {
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
    } else  if (data.type == 1) {
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
    chatOptions = mergeObject(
      {
        user: game.user.id,
        flavor: this.flavorText,
        template: this.constructor.CHAT_TEMPLATE,
      },
      chatOptions
    );


    let isPrivate = chatOptions.isPrivate;

    const chatData = {
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
    return html;
  }

  /* -------------------------------------------- */
  async toMessage(chatOptions, { rollMode = null, create = true } = {}) {

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
  }

  /** @override */
  toJSON() {
    const json = super.toJSON();
    json.data = this.data;
    return json;
  }

  /** @override */
  static fromData(data) {
    const roll = super.fromData(data);
    roll.data = data.data;
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
}

