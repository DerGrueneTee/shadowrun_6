
export default class SR6Roll extends Roll {

  static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
  static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

  constructor(...args) {
    super(...args);
    this.data = args[1];
    this.p = {};
  }

  /** @override */
  evaluate() {
    let total;
    let dieResult;
    let data = this.data;
  //  let _roll = new Roll(this.createFormula(data.value, -1, true));
    
  //  _roll = _roll.evaluate();
    let formula = this.createFormula(data.value, -1, true);


    let die = new Die(formula).evaluate();

    this._rolled = true;
    this._total = total;
    this._formula = data.formula;
    return this;
  }

  /* -------------------------------------------- */
  /** @override */
  roll() {
    return this.evaluate();
  }

  /* -------------------------------------------- */
  /** @override */
  getTooltip() {
    let parts = {};
    return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { parts, data: this.data });
  }

  /* -------------------------------------------- 
  * Hier wird die Ausgabe zusammengeschustert
  */
  async render(chatOptions = {}) {
    chatOptions = mergeObject(
      {
        user: game.user._id,
        flavor: this.flavorText,
        template: this.constructor.CHAT_TEMPLATE,
      },
      chatOptions
    );


    let isPrivate = chatOptions.isPrivate;

    const chatData = {
      formula: isPrivate ? "???" : this._formula,
      flavor: isPrivate ? null : chatOptions.flavor,
      user: chatOptions.user,
      tooltip: isPrivate ? "" : await this.getTooltip(),
      total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
      data: this.data,
      publicRoll: !chatOptions.isPrivate,
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
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        content: this.total,
        sound: CONFIG.sounds.dice,
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
}

